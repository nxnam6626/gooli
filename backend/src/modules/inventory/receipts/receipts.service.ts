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

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReceiptDto: CreateReceiptDto, userId: number) {
    const { note, items } = createReceiptDto;

    // Validate products exist
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
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
          if (item.isFaulty) {
            await tx.stock.upsert({
              where: { productId: item.productId },
              create: {
                productId: item.productId,
                quantity: 0,
                faultyQty: item.quantity,
              },
              update: {
                faultyQty: { increment: item.quantity },
              },
            });
          } else {
            await tx.stock.upsert({
              where: { productId: item.productId },
              create: {
                productId: item.productId,
                quantity: item.quantity,
                faultyQty: 0,
              },
              update: {
                quantity: { increment: item.quantity },
              },
            });
          }
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
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
          include: { product: true },
        });

        if (!stock) {
          throw new NotFoundException(
            `Không tìm thấy dữ liệu kho cho sản phẩm ID ${item.productId}.`,
          );
        }

        if (item.isFaulty) {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { faultyQty: { increment: item.quantity } },
          });
        } else {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          });
        }
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

    let headerRowIndex = -1;
    for (let r = 0; r < Math.min(rawData.length, 10); r++) {
      const row = rawData[r];
      if (row && REQUIRED_EXCEL_COLUMNS.every((col) => row.includes(col))) {
        headerRowIndex = r;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new BadRequestException(
        `Không tìm thấy tiêu đề cột chuẩn trong Excel. Cần chứa ít nhất: ${REQUIRED_EXCEL_COLUMNS.map((c) => `"${c}"`).join(', ')}.`,
      );
    }

    const headers: string[] = (rawData[headerRowIndex] ?? []).map((h) =>
      String(h || '').trim(),
    );
    const dataRows = rawData.slice(headerRowIndex + 1);

    const errors: { row: number; item: string; error: string }[] = [];
    const parsedItems: {
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
    }[] = [];

    const colIdxPartnerCode = headers.indexOf(
      RECEIPT_EXCEL_COLUMNS.PARTNER_CODE,
    );
    const colIdxInvoiceNo = headers.indexOf(
      RECEIPT_EXCEL_COLUMNS.INVOICE_NUMBER,
    );
    const colIdxInvoiceDate = headers.indexOf(
      RECEIPT_EXCEL_COLUMNS.INVOICE_DATE,
    );
    const colIdxSku = headers.indexOf(RECEIPT_EXCEL_COLUMNS.SKU);
    const colIdxSupplierProdName = headers.indexOf(
      RECEIPT_EXCEL_COLUMNS.SUPPLIER_PRODUCT_NAME,
    );
    const colIdxQty = headers.indexOf(RECEIPT_EXCEL_COLUMNS.QUANTITY);
    const colIdxPrice = headers.indexOf(RECEIPT_EXCEL_COLUMNS.PRICE);
    const colIdxVat = headers.indexOf(RECEIPT_EXCEL_COLUMNS.VAT_RATE);
    const colIdxNote = headers.indexOf(RECEIPT_EXCEL_COLUMNS.NOTE);

    const allProducts = await this.prisma.product.findMany({
      select: { id: true, sku: true },
    });
    const productSkuMap = new Map<string, number>(
      allProducts.map((p) => [p.sku.toUpperCase(), p.id]),
    );

    const allPartners = await this.prisma.partner.findMany({
      select: { id: true, code: true, type: true },
    });
    const partnerCodeMap = new Map<string, { id: number; type: string }>(
      allPartners.map((p) => [
        p.code.toUpperCase(),
        { id: p.id, type: p.type },
      ]),
    );

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

      const partnerCode = String(row[colIdxPartnerCode] || '').trim();
      const invoiceNumber = String(row[colIdxInvoiceNo] || '').trim();
      const invoiceDateRaw = row[colIdxInvoiceDate];
      const sku = String(row[colIdxSku] || '').trim();
      const supplierProductName = String(
        row[colIdxSupplierProdName] || '',
      ).trim();
      const quantityRaw = row[colIdxQty];
      const priceRaw = row[colIdxPrice];
      const vatRateRaw = row[colIdxVat];
      const note =
        colIdxNote !== -1 ? String(row[colIdxNote] || '').trim() : '';

      if (!partnerCode) {
        errors.push({
          row: rowIndex,
          item: 'Mã đối tác',
          error: 'Không được để trống.',
        });
      }
      if (!invoiceNumber) {
        errors.push({
          row: rowIndex,
          item: 'Số hóa đơn',
          error: 'Không được để trống.',
        });
      }
      if (!sku) {
        errors.push({
          row: rowIndex,
          item: 'Mã SKU',
          error: 'Không được để trống.',
        });
      }

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

      let invoiceDate: Date | null = null;
      if (invoiceDateRaw) {
        const rawStr = String(invoiceDateRaw).trim();
        const dateNum = Number(invoiceDateRaw);

        if (typeof invoiceDateRaw === 'number' && !isNaN(dateNum)) {
          invoiceDate = new Date(Math.round((dateNum - 25569) * 86400 * 1000));
        } else if (/^\d+$/.test(rawStr)) {
          // If serial date number is represented as a string (e.g. "46182")
          invoiceDate = new Date(
            Math.round((parseInt(rawStr, 10) - 25569) * 86400 * 1000),
          );
        } else {
          // Match DD/MM/YYYY or DD-MM-YYYY
          const dmyMatch = rawStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
          if (dmyMatch) {
            const day = parseInt(dmyMatch[1], 10);
            const month = parseInt(dmyMatch[2], 10) - 1;
            const year = parseInt(dmyMatch[3], 10);
            invoiceDate = new Date(year, month, day);
          } else {
            invoiceDate = new Date(rawStr);
          }
        }

        if (
          !invoiceDate ||
          isNaN(invoiceDate.getTime()) ||
          invoiceDate.getFullYear() < 1970 ||
          invoiceDate.getFullYear() > 2100
        ) {
          errors.push({
            row: rowIndex,
            item: `Ngày hóa đơn: ${invoiceDateRaw}`,
            error:
              'Ngày hóa đơn không hợp lệ (định dạng DD/MM/YYYY hoặc YYYY-MM-DD, năm 1970-2100).',
          });
          invoiceDate = null;
        }
      }

      let productId: number | undefined;
      if (sku) {
        productId = productSkuMap.get(sku.toUpperCase());
        if (!productId) {
          errors.push({
            row: rowIndex,
            item: sku,
            error: `Mã SKU không tồn tại trong hệ thống.`,
          });
        }
      }

      let partnerId: number | undefined;
      if (partnerCode) {
        const pInfo = partnerCodeMap.get(partnerCode.toUpperCase());
        if (!pInfo) {
          errors.push({
            row: rowIndex,
            item: partnerCode,
            error: `Mã đối tác không tồn tại.`,
          });
        } else if (pInfo.type !== 'SUPPLIER') {
          errors.push({
            row: rowIndex,
            item: partnerCode,
            error: `Đối tác phải là Nhà cung cấp (SUPPLIER).`,
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

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const groupedReceipts = new Map<string, typeof parsedItems>();
    for (const item of parsedItems) {
      const groupKey = `${item.partnerId}_${item.invoiceNumber}`;
      let list = groupedReceipts.get(groupKey);
      if (!list) {
        list = [];
        groupedReceipts.set(groupKey, list);
      }
      list.push(item);
    }

    await this.prisma.$transaction(async (tx) => {
      for (const [, items] of groupedReceipts.entries()) {
        const firstItem = items[0];
        const partnerId = firstItem.partnerId;
        const invoiceNumber = firstItem.invoiceNumber;
        const invoiceDate = firstItem.invoiceDate;
        const note = firstItem.note;

        const code = await this.generateReceiptCode(tx);

        let preTaxTotal = 0;
        let postTaxTotal = 0;
        for (const item of items) {
          const itemPreTax = item.price * item.quantity;
          const itemPostTax = itemPreTax * (1 + item.vatRate / 100);
          preTaxTotal += itemPreTax;
          postTaxTotal += itemPostTax;
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
          await tx.stock.upsert({
            where: { productId: item.productId! },
            create: {
              product: { connect: { id: item.productId! } },
              quantity: item.quantity,
              faultyQty: 0,
            },
            update: {
              quantity: { increment: item.quantity },
            },
          });
        }

        await tx.partner.update({
          where: { id: partnerId },
          data: {
            totalDebt: { increment: postTaxTotal },
          },
        });
      }
    });

    return { success: true, count: groupedReceipts.size };
  }

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
}
