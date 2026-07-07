import { Injectable, BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RECEIPT_EXCEL_COLUMNS,
  REQUIRED_EXCEL_COLUMNS,
} from '../constants/receipt-excel-columns';
import {
  ExcelColumnIndex,
  ParsedReceiptItem,
  RowError,
} from '../interfaces/parsed-receipt-item.interface';
import { parseExcelDate } from '../utils/parse-excel-date.util';
import { ReceiptCodeGeneratorService } from './receipt-code-generator.service';
import { StockUpdaterService } from './stock-updater.service';

/**
 * Handles all Excel-based receipt import logic.
 * Completely decoupled from the CRUD operations in ReceiptsService.
 */
@Injectable()
export class ReceiptExcelImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: ReceiptCodeGeneratorService,
    private readonly stockUpdater: StockUpdaterService,
  ) {}

  async import(file: Express.Multer.File, userId: number) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên file Excel.');
    }

    const rawData = this.readRawData(file);
    const headerRowIndex = this.detectHeaderRow(rawData);
    const { headers, dataRows } = this.extractHeaderAndRows(rawData, headerRowIndex);
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

  private buildColumnIndex(headers: string[]): ExcelColumnIndex {
    return {
      partnerCode: headers.indexOf(RECEIPT_EXCEL_COLUMNS.PARTNER_CODE),
      invoiceNo: headers.indexOf(RECEIPT_EXCEL_COLUMNS.INVOICE_NUMBER),
      invoiceDate: headers.indexOf(RECEIPT_EXCEL_COLUMNS.INVOICE_DATE),
      sku: headers.indexOf(RECEIPT_EXCEL_COLUMNS.SKU),
      supplierProdName: headers.indexOf(RECEIPT_EXCEL_COLUMNS.SUPPLIER_PRODUCT_NAME),
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
    colIdx: ExcelColumnIndex,
    headerRowIndex: number,
    productSkuMap: Map<string, number>,
    partnerCodeMap: Map<string, { id: number; type: string }>,
  ): { parsedItems: ParsedReceiptItem[]; errors: RowError[] } {
    const errors: RowError[] = [];
    const parsedItems: ParsedReceiptItem[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowIndex = headerRowIndex + 2 + i;

      if (
        !row ||
        row.length === 0 ||
        row.every((v) => v === undefined || v === null || v === '')
      ) {
        continue;
      }

      const rowErrors: RowError[] = [];

      const partnerCode = String(row[colIdx.partnerCode] || '').trim();
      const invoiceNumber = String(row[colIdx.invoiceNo] || '').trim();
      const invoiceDateRaw = row[colIdx.invoiceDate];
      const sku = String(row[colIdx.sku] || '').trim();
      const supplierProductName = String(row[colIdx.supplierProdName] || '').trim();
      const quantityRaw = row[colIdx.qty];
      const priceRaw = row[colIdx.price];
      const vatRateRaw = row[colIdx.vat];
      const note = colIdx.note !== -1 ? String(row[colIdx.note] || '').trim() : '';

      if (!partnerCode)
        rowErrors.push({ row: rowIndex, item: 'Mã đối tác', error: 'Không được để trống.' });
      if (!invoiceNumber)
        rowErrors.push({ row: rowIndex, item: 'Số hóa đơn', error: 'Không được để trống.' });
      if (!sku)
        rowErrors.push({ row: rowIndex, item: 'Mã SKU', error: 'Không được để trống.' });

      const quantity = Number(quantityRaw);
      if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        rowErrors.push({
          row: rowIndex,
          item: `Số lượng: ${quantityRaw}`,
          error: 'Số lượng phải là số nguyên lớn hơn 0.',
        });
      }

      const price = Number(priceRaw);
      if (isNaN(price) || price < 0) {
        rowErrors.push({
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
        rowErrors.push({
          row: rowIndex,
          item: `Thuế suất VAT: ${vatRateRaw}`,
          error: 'Thuế suất VAT phải là số từ 0 đến 100.',
        });
      }

      const invoiceDate = parseExcelDate(invoiceDateRaw, rowIndex, rowErrors);

      let productId: number | undefined;
      if (sku) {
        productId = productSkuMap.get(sku.toUpperCase());
        if (!productId)
          rowErrors.push({
            row: rowIndex,
            item: sku,
            error: 'Mã SKU không tồn tại trong hệ thống.',
          });
      }

      let partnerId: number | undefined;
      if (partnerCode) {
        const pInfo = partnerCodeMap.get(partnerCode.toUpperCase());
        if (!pInfo) {
          rowErrors.push({
            row: rowIndex,
            item: partnerCode,
            error: 'Mã đối tác không tồn tại.',
          });
        } else if (pInfo.type !== 'SUPPLIER') {
          rowErrors.push({
            row: rowIndex,
            item: partnerCode,
            error: 'Đối tác phải là Nhà cung cấp (SUPPLIER).',
          });
        } else {
          partnerId = pInfo.id;
        }
      }

      if (rowErrors.length === 0) {
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
      } else {
        errors.push(...rowErrors);
      }
    }

    return { parsedItems, errors };
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
        const code = await this.codeGenerator.generate(tx);

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
          await this.stockUpdater.applyIncrement(
            tx,
            item.productId!,
            item.quantity,
            false,
          );
        }

        await tx.partner.update({
          where: { id: partnerId },
          data: { totalDebt: { increment: postTaxTotal } },
        });
      }
    });
  }
}
