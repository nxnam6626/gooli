import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { TransactionStatus, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import {
  RECEIPT_EXCEL_COLUMNS,
  REQUIRED_EXCEL_COLUMNS,
} from './constants/receipt-excel-columns';

interface ParsedReceiptItem {
  partnerCode: string;
  invoiceNumber: string;
  invoiceDate: Date | null;
  sku: string;
  supplierProductName: string;
  quantity: number;
  price: number;
  vatRate: number;
  note: string;
  rowIndex: number;
  productId?: number;
  partnerId?: number;
}

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReceiptDto: CreateReceiptDto, userId: number) {
    const { note, items } = createReceiptDto;

    // Batch-validate all product IDs in a single query instead of N individual lookups
    const productIds = items.map((item) => item.productId);
    const foundProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const foundIds = new Set(foundProducts.map((p) => p.id));

    for (const item of items) {
      if (!foundIds.has(item.productId)) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với ID ${item.productId}.`,
        );
      }
    }

    const isPending = !!createReceiptDto.expectedDeliveryDate;

    const receipt = await this.prisma.$transaction(async (tx) => {
      const code = await this.generateReceiptCode(tx);
      // Create receipt
      const createdReceipt = await tx.receipt.create({
        data: {
          code,
          note,
          createdById: userId,
          approvedById: isPending ? null : userId,
          approvedAt: isPending ? null : new Date(),
          partnerId: createReceiptDto.partnerId,
          status: isPending
            ? TransactionStatus.PENDING
            : TransactionStatus.APPROVED,
          expectedDeliveryDate: createReceiptDto.expectedDeliveryDate
            ? new Date(createReceiptDto.expectedDeliveryDate)
            : null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              isFaulty: item.isFaulty ?? false,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, slug: true },
              },
            },
          },
        },
      });

      // Update Stock only if APPROVED
      if (!isPending) {
        for (const item of createdReceipt.items) {
          await this.applyStockIncrement(
            tx,
            item.productId,
            item.quantity,
            item.isFaulty,
          );
        }
      }

      return createdReceipt;
    });

    return receipt;
  }

  async findAll() {
    return this.prisma.receipt.findMany({
      include: {
        partner: { select: { id: true, name: true, code: true } },
        items: {
          include: {
            product: {
              select: { name: true, slug: true, unit: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    });
    if (!receipt) {
      throw new NotFoundException(
        `Không tìm thấy phiếu nhập kho với ID ${id}.`,
      );
    }
    return receipt;
  }

  async approve(id: number, approvedById: number) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!receipt) {
      throw new NotFoundException(
        `Không tìm thấy phiếu nhập kho với ID ${id}.`,
      );
    }

    if (receipt.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Phiếu nhập kho này đã được duyệt hoặc từ chối.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of receipt.items) {
        await this.applyStockIncrement(
          tx,
          item.productId,
          item.quantity,
          item.isFaulty,
        );
      }

      await tx.receipt.update({
        where: { id },
        data: {
          status: TransactionStatus.APPROVED,
          approvedById,
          approvedAt: new Date(),
        },
      });
    });

    return this.findOne(id);
  }

  async reject(id: number, approvedById: number) {
    const receipt = await this.findOne(id);

    if (receipt.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Phiếu nhập kho này đã được duyệt hoặc từ chối.',
      );
    }

    return this.prisma.receipt.update({
      where: { id },
      data: {
        status: TransactionStatus.REJECTED,
        approvedById,
        approvedAt: new Date(),
      },
      include: {
        items: true,
      },
    });
  }

  async importExcel(file: Express.Multer.File, userId: number) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên file Excel.');
    }

    const rawData = this.readRawData(file);
    const headerRowIndex = this.detectHeaderRow(rawData);
    const { headers, dataRows } = this.extractHeaderAndRows(
      rawData,
      headerRowIndex,
    );
    const colIdx = this.buildColumnIndex(headers);

    const [productSkuMap, partnerCodeMap] = await Promise.all([
      this.loadProductSkuMap(),
      this.loadPartnerCodeMap(),
    ]);

    const { parsedItems, errors } = this.parseAllRows(
      dataRows,
      colIdx,
      headerRowIndex,
      productSkuMap,
      partnerCodeMap,
    );

    if (errors.length > 0) return { success: false, errors };

    const groupedReceipts = this.groupByInvoice(parsedItems);
    await this.persistGroupedReceipts(groupedReceipts, userId);

    return { success: true, count: groupedReceipts.size };
  }

  // ─── Excel read helpers ──────────────────────────────────────────────────

  private readRawData(
    file: Express.Multer.File,
  ): (string | number | null | undefined)[][] {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException('File không hợp lệ hoặc bị lỗi định dạng.');
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as unknown as (string | number | null | undefined)[][];

    if (rawData.length < 2) {
      throw new BadRequestException(
        'File Excel trống hoặc không chứa dữ liệu nhập kho.',
      );
    }

    return rawData;
  }

  private detectHeaderRow(
    rawData: (string | number | null | undefined)[][],
  ): number {
    for (let r = 0; r < Math.min(rawData.length, 10); r++) {
      const row = rawData[r];
      if (row && REQUIRED_EXCEL_COLUMNS.every((col) => row.includes(col))) {
        return r;
      }
    }
    throw new BadRequestException(
      `Không tìm thấy tiêu đề cột chuẩn trong Excel. Cần chứa ít nhất: ${REQUIRED_EXCEL_COLUMNS.map((c) => `"${c}"`).join(', ')}.`,
    );
  }

  private extractHeaderAndRows(
    rawData: (string | number | null | undefined)[][],
    headerRowIndex: number,
  ) {
    const headers: string[] = (rawData[headerRowIndex] ?? []).map((h) =>
      String(h || '').trim(),
    );
    return { headers, dataRows: rawData.slice(headerRowIndex + 1) };
  }

  private buildColumnIndex(headers: string[]) {
    return {
      partnerCode: headers.indexOf(RECEIPT_EXCEL_COLUMNS.PARTNER_CODE),
      invoiceNo: headers.indexOf(RECEIPT_EXCEL_COLUMNS.INVOICE_NUMBER),
      invoiceDate: headers.indexOf(RECEIPT_EXCEL_COLUMNS.INVOICE_DATE),
      sku: headers.indexOf(RECEIPT_EXCEL_COLUMNS.SKU),
      supplierProdName: headers.indexOf(
        RECEIPT_EXCEL_COLUMNS.SUPPLIER_PRODUCT_NAME,
      ),
      qty: headers.indexOf(RECEIPT_EXCEL_COLUMNS.QUANTITY),
      price: headers.indexOf(RECEIPT_EXCEL_COLUMNS.PRICE),
      vat: headers.indexOf(RECEIPT_EXCEL_COLUMNS.VAT_RATE),
      note: headers.indexOf(RECEIPT_EXCEL_COLUMNS.NOTE),
    };
  }

  // ─── DB lookup loaders ───────────────────────────────────────────────────

  private async loadProductSkuMap(): Promise<Map<string, number>> {
    const allProducts = await this.prisma.product.findMany({
      select: { id: true, sku: true },
    });
    return new Map(allProducts.map((p) => [p.sku.toUpperCase(), p.id]));
  }

  private async loadPartnerCodeMap(): Promise<
    Map<string, { id: number; type: string }>
  > {
    const allPartners = await this.prisma.partner.findMany({
      select: { id: true, code: true, type: true },
    });
    return new Map(
      allPartners.map((p) => [p.code.toUpperCase(), { id: p.id, type: p.type }]),
    );
  }

  // ─── Row parsing ─────────────────────────────────────────────────────────

  private parseAllRows(
    dataRows: (string | number | null | undefined)[][],
    colIdx: ReturnType<typeof this.buildColumnIndex>,
    headerRowIndex: number,
    productSkuMap: Map<string, number>,
    partnerCodeMap: Map<string, { id: number; type: string }>,
  ) {
    const errors: { row: number; item: string; error: string }[] = [];
    const parsedItems: ParsedReceiptItem[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowIndex = headerRowIndex + 2 + i;

      if (
        !row ||
        row.length === 0 ||
        row.every((val) => val === undefined || val === null || val === '')
      ) {
        continue;
      }

      const partnerCode = String(row[colIdx.partnerCode] || '').trim();
      const invoiceNumber = String(row[colIdx.invoiceNo] || '').trim();
      const invoiceDateRaw = row[colIdx.invoiceDate];
      const sku = String(row[colIdx.sku] || '').trim();
      const supplierProductName = String(
        row[colIdx.supplierProdName] || '',
      ).trim();
      const quantityRaw = row[colIdx.qty];
      const priceRaw = row[colIdx.price];
      const vatRateRaw = row[colIdx.vat];
      const note =
        colIdx.note !== -1 ? String(row[colIdx.note] || '').trim() : '';

      if (!partnerCode)
        errors.push({ row: rowIndex, item: 'Mã đối tác', error: 'Không được để trống.' });
      if (!invoiceNumber)
        errors.push({ row: rowIndex, item: 'Số hóa đơn', error: 'Không được để trống.' });
      if (!sku)
        errors.push({ row: rowIndex, item: 'Mã SKU', error: 'Không được để trống.' });

      const quantity = Number(quantityRaw);
      if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        errors.push({
          row: rowIndex,
          item: `Số lượng: ${quantityRaw}`,
          error: 'Số lượng phải là số nguyên lớn hơn 0.',
        });
      }

      const price = Number(priceRaw);
      if (isNaN(price) || price < 0) {
        errors.push({
          row: rowIndex,
          item: `Đơn giá: ${priceRaw}`,
          error: 'Đơn giá nhập không được nhỏ hơn 0.',
        });
      }

      const vatRate =
        vatRateRaw !== undefined && vatRateRaw !== null && vatRateRaw !== ''
          ? Number(vatRateRaw)
          : 10;
      if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
        errors.push({
          row: rowIndex,
          item: `Thuế suất VAT: ${vatRateRaw}`,
          error: 'Thuế suất VAT phải là số từ 0 đến 100.',
        });
      }

      const invoiceDate = this.parseExcelDate(invoiceDateRaw, rowIndex, errors);

      let productId: number | undefined;
      if (sku) {
        productId = productSkuMap.get(sku.toUpperCase());
        if (!productId)
          errors.push({ row: rowIndex, item: sku, error: 'Mã SKU không tồn tại trong hệ thống.' });
      }

      let partnerId: number | undefined;
      if (partnerCode) {
        const pInfo = partnerCodeMap.get(partnerCode.toUpperCase());
        if (!pInfo) {
          errors.push({ row: rowIndex, item: partnerCode, error: 'Mã đối tác không tồn tại.' });
        } else if (pInfo.type !== 'SUPPLIER') {
          errors.push({
            row: rowIndex,
            item: partnerCode,
            error: 'Đối tác phải là Nhà cung cấp (SUPPLIER).',
          });
        } else {
          partnerId = pInfo.id;
        }
      }

      if (errors.length === 0) {
        parsedItems.push({
          partnerCode,
          partnerId,
          invoiceNumber,
          invoiceDate,
          sku,
          supplierProductName,
          quantity,
          price,
          vatRate,
          note,
          rowIndex,
          productId,
        });
      }
    }

    return { parsedItems, errors };
  }

  private parseExcelDate(
    raw: string | number | null | undefined,
    rowIndex: number,
    errors: { row: number; item: string; error: string }[],
  ): Date | null {
    if (!raw) return null;

    const rawStr = String(raw).trim();
    const dateNum = Number(raw);
    let date: Date | null = null;

    if (typeof raw === 'number' && !isNaN(dateNum)) {
      date = new Date(Math.round((dateNum - 25569) * 86400 * 1000));
    } else if (/^\d+$/.test(rawStr)) {
      date = new Date(
        Math.round((parseInt(rawStr, 10) - 25569) * 86400 * 1000),
      );
    } else {
      const dmyMatch = rawStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (dmyMatch) {
        date = new Date(
          parseInt(dmyMatch[3], 10),
          parseInt(dmyMatch[2], 10) - 1,
          parseInt(dmyMatch[1], 10),
        );
      } else {
        date = new Date(rawStr);
      }
    }

    if (
      !date ||
      isNaN(date.getTime()) ||
      date.getFullYear() < 1970 ||
      date.getFullYear() > 2100
    ) {
      errors.push({
        row: rowIndex,
        item: `Ngày hóa đơn: ${raw}`,
        error:
          'Ngày hóa đơn không hợp lệ (định dạng DD/MM/YYYY hoặc YYYY-MM-DD, năm 1970-2100).',
      });
      return null;
    }

    return date;
  }

  // ─── Grouping & persistence ──────────────────────────────────────────────

  private groupByInvoice(
    items: ParsedReceiptItem[],
  ): Map<string, ParsedReceiptItem[]> {
    const grouped = new Map<string, ParsedReceiptItem[]>();
    for (const item of items) {
      const key = `${item.partnerId}_${item.invoiceNumber}`;
      const list = grouped.get(key) ?? [];
      if (!grouped.has(key)) grouped.set(key, list);
      list.push(item);
    }
    return grouped;
  }

  private async persistGroupedReceipts(
    groupedReceipts: Map<string, ParsedReceiptItem[]>,
    userId: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const [, items] of groupedReceipts.entries()) {
        const { partnerId, invoiceNumber, invoiceDate, note } = items[0];
        const code = await this.generateReceiptCode(tx);

        let preTaxTotal = 0;
        let postTaxTotal = 0;
        for (const item of items) {
          const pre = item.price * item.quantity;
          preTaxTotal += pre;
          postTaxTotal += pre * (1 + item.vatRate / 100);
        }

        await tx.receipt.create({
          data: {
            code,
            status: TransactionStatus.APPROVED,
            createdById: userId,
            approvedById: userId,
            approvedAt: new Date(),
            partnerId,
            invoiceNumber,
            invoiceDate,
            preTaxTotal,
            postTaxTotal,
            note: note || `Nhập kho tự động qua file Excel HĐ ${invoiceNumber}`,
            items: {
              create: items.map((item) => ({
                product: { connect: { id: item.productId! } },
                quantity: item.quantity,
                price: item.price,
                vatRate: item.vatRate,
                supplierProductName: item.supplierProductName || null,
              })),
            },
          },
        });

        for (const item of items) {
          await this.applyStockIncrement(tx, item.productId!, item.quantity, false);
        }

        await tx.partner.update({
          where: { id: partnerId },
          data: { totalDebt: { increment: postTaxTotal } },
        });
      }
    });
  }

  // ─── Code generation & stock ─────────────────────────────────────────────

  private async generateReceiptCode(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    // Lock table to prevent concurrent transactions from counting at the same time
    await tx.$executeRawUnsafe('LOCK TABLE "Receipt" IN EXCLUSIVE MODE');

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const countToday = await tx.receipt.count({
      where: {
        createdAt: { gte: todayStart },
      },
    });
    return `NK-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
  }

  private async applyStockIncrement(
    tx: Prisma.TransactionClient,
    productId: number,
    quantity: number,
    isFaulty: boolean,
  ): Promise<void> {
    await tx.stock.upsert({
      where: { productId },
      create: {
        productId,
        quantity: isFaulty ? 0 : quantity,
        faultyQty: isFaulty ? quantity : 0,
      },
      update: isFaulty
        ? { faultyQty: { increment: quantity } }
        : { quantity: { increment: quantity } },
    });
  }
}

