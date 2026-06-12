import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { PartnerType, PaymentStatus } from '@prisma/client';
import { RevalidationService } from '../webhook/revalidation.service';

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidationService: RevalidationService,
  ) {}

  // 1. Customer Return (Khách trả lại hàng)
  async createCustomerReturn(dto: CreateReturnDto, userId: number) {
    const { partnerId, exportId, items, note } = dto;

    const partner = await this.prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) {
      throw new NotFoundException(`Không tìm thấy đối tác với ID ${partnerId}.`);
    }
    if (partner.type !== PartnerType.CUSTOMER) {
      throw new BadRequestException('Đối tác của phiếu nhập hàng hoàn trả phải là khách hàng (CUSTOMER).');
    }

    const revalidateQueue: { slug: string; oldQty: number; newQty: number }[] = [];

    const resultDoc = await this.prisma.$transaction(async (tx) => {
      // Validate all products exist
      for (const item of items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod) {
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${item.productId}.`);
        }
      }

      // Calculate totals
      let preTaxTotal = 0;
      let postTaxTotal = 0;
      for (const item of items) {
        const vat = item.vatRate ?? 10;
        const itemPreTax = item.price * item.quantity;
        const itemPostTax = itemPreTax * (1 + vat / 100);
        preTaxTotal += itemPreTax;
        postTaxTotal += itemPostTax;
      }

      // Rollback and update export payment if exportId is provided
      if (exportId) {
        const exportBill = await tx.export.findUnique({ where: { id: exportId } });
        if (!exportBill) {
          throw new NotFoundException(`Không tìm thấy phiếu xuất kho với ID ${exportId}.`);
        }
        if (exportBill.partnerId !== partnerId) {
          throw new BadRequestException('Phiếu xuất kho này không thuộc đối tác được chọn.');
        }

        const unpaidAmount = Number(exportBill.postTaxTotal) - Number(exportBill.paidAmount);
        if (unpaidAmount > 0) {
          const applied = Math.min(unpaidAmount, postTaxTotal);
          const newPaidAmount = Number(exportBill.paidAmount) + applied;
          await tx.export.update({
            where: { id: exportId },
            data: {
              paidAmount: newPaidAmount,
              paymentStatus: newPaidAmount >= Number(exportBill.postTaxTotal) ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID,
            },
          });
        }
      }

      // Update Stock (Increase for customer returns)
      for (const item of items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
          include: { product: true },
        });

        const oldQty = stock ? stock.quantity : 0;
        const newQty = oldQty + item.quantity;

        await tx.stock.upsert({
          where: { productId: item.productId },
          create: {
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            faultyQty: 0,
          },
          update: {
            quantity: { increment: item.quantity },
          },
        });

        revalidateQueue.push({
          slug: stock ? stock.product.slug : '',
          oldQty,
          newQty,
        });
      }

      // Decrement customer's totalDebt (Negative totalDebt means prepayments/money we owe them)
      await tx.partner.update({
        where: { id: partnerId },
        data: {
          totalDebt: { decrement: postTaxTotal },
        },
      });

      // Generate unique code: TH-YYYYMMDD-XXX
      let finalCode = dto.code?.trim();
      if (!finalCode) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const countToday = await tx.customerReturn.count({
          where: { createdAt: { gte: todayStart } },
        });
        finalCode = `TH-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
      }

      // Create return document
      const retDoc = await tx.customerReturn.create({
        data: {
          code: finalCode,
          partnerId,
          exportId: exportId || null,
          createdById: userId,
          note: note || `Hệ thống giảm trừ nợ ${postTaxTotal.toLocaleString('vi-VN')} đ cho đối tác do trả hàng theo Phiếu trả số ${finalCode}`,
          preTaxTotal,
          postTaxTotal,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              vatRate: item.vatRate ?? 10,
            })),
          },
        },
        include: {
          partner: true,
          items: { include: { product: true } },
        },
      });

      return retDoc;
    });

    for (const task of revalidateQueue) {
      if (task.slug) {
        this.revalidationService.checkAndTrigger(task.slug, task.oldQty, task.newQty);
      }
    }

    return resultDoc;
  }

  // 2. Supplier Return (Xuất trả hàng cho NCC)
  async createSupplierReturn(dto: CreateReturnDto, userId: number) {
    const { partnerId, receiptId, items, note } = dto;

    const partner = await this.prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) {
      throw new NotFoundException(`Không tìm thấy đối tác với ID ${partnerId}.`);
    }
    if (partner.type !== PartnerType.SUPPLIER) {
      throw new BadRequestException('Đối tác của phiếu xuất trả hàng phải là nhà cung cấp (SUPPLIER).');
    }

    const revalidateQueue: { slug: string; oldQty: number; newQty: number }[] = [];

    const resultDoc = await this.prisma.$transaction(async (tx) => {
      // Validate all products exist and check stock levels
      for (const item of items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod) {
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${item.productId}.`);
        }

        const stock = await tx.stock.findUnique({ where: { productId: item.productId } });
        const available = stock ? stock.quantity : 0;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Không đủ tồn kho đạt chuẩn cho sản phẩm ID ${item.productId} (Yêu cầu: ${item.quantity}, Hiện tại: ${available}).`
          );
        }
      }

      // Calculate totals
      let preTaxTotal = 0;
      let postTaxTotal = 0;
      for (const item of items) {
        const vat = item.vatRate ?? 10;
        const itemPreTax = item.price * item.quantity;
        const itemPostTax = itemPreTax * (1 + vat / 100);
        preTaxTotal += itemPreTax;
        postTaxTotal += itemPostTax;
      }

      // Rollback and update receipt payment if receiptId is provided
      if (receiptId) {
        const receipt = await tx.receipt.findUnique({ where: { id: receiptId } });
        if (!receipt) {
          throw new NotFoundException(`Không tìm thấy phiếu nhập kho với ID ${receiptId}.`);
        }
        if (receipt.partnerId !== partnerId) {
          throw new BadRequestException('Phiếu nhập kho này không thuộc đối tác được chọn.');
        }

        const unpaidAmount = Number(receipt.postTaxTotal) - Number(receipt.paidAmount);
        if (unpaidAmount > 0) {
          const applied = Math.min(unpaidAmount, postTaxTotal);
          const newPaidAmount = Number(receipt.paidAmount) + applied;
          await tx.receipt.update({
            where: { id: receiptId },
            data: {
              paidAmount: newPaidAmount,
              paymentStatus: newPaidAmount >= Number(receipt.postTaxTotal) ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID,
            },
          });
        }
      }

      // Update Stock (Decrease for supplier returns)
      for (const item of items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
          include: { product: true },
        });

        const oldQty = stock ? stock.quantity : 0;
        const newQty = oldQty - item.quantity;

        await tx.stock.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        revalidateQueue.push({
          slug: stock ? stock.product.slug : '',
          oldQty,
          newQty,
        });
      }

      // Decrement supplier's totalDebt (We owe them less money)
      await tx.partner.update({
        where: { id: partnerId },
        data: {
          totalDebt: { decrement: postTaxTotal },
        },
      });

      // Generate unique code: XT-YYYYMMDD-XXX
      let finalCode = dto.code?.trim();
      if (!finalCode) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const countToday = await tx.supplierReturn.count({
          where: { createdAt: { gte: todayStart } },
        });
        finalCode = `XT-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
      }

      // Create return document
      const retDoc = await tx.supplierReturn.create({
        data: {
          code: finalCode,
          partnerId,
          receiptId: receiptId || null,
          createdById: userId,
          note: note || `Hệ thống giảm trừ nợ ${postTaxTotal.toLocaleString('vi-VN')} đ cho đối tác do xuất trả hàng theo Phiếu trả số ${finalCode}`,
          preTaxTotal,
          postTaxTotal,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              vatRate: item.vatRate ?? 10,
            })),
          },
        },
        include: {
          partner: true,
          items: { include: { product: true } },
        },
      });

      return retDoc;
    });

    for (const task of revalidateQueue) {
      if (task.slug) {
        this.revalidationService.checkAndTrigger(task.slug, task.oldQty, task.newQty);
      }
    }

    return resultDoc;
  }

  async findAllCustomerReturns() {
    return this.prisma.customerReturn.findMany({
      include: {
        partner: true,
        items: { include: { product: true } },
        createdByUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllSupplierReturns() {
    return this.prisma.supplierReturn.findMany({
      include: {
        partner: true,
        items: { include: { product: true } },
        createdByUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCustomerReturnById(id: number) {
    const doc = await this.prisma.customerReturn.findUnique({
      where: { id },
      include: {
        partner: true,
        items: { include: { product: true } },
        createdByUser: { select: { name: true, email: true } },
      },
    });
    if (!doc) {
      throw new NotFoundException(`Không tìm thấy phiếu trả hàng của khách hàng với ID ${id}.`);
    }
    return doc;
  }

  async findSupplierReturnById(id: number) {
    const doc = await this.prisma.supplierReturn.findUnique({
      where: { id },
      include: {
        partner: true,
        items: { include: { product: true } },
        createdByUser: { select: { name: true, email: true } },
      },
    });
    if (!doc) {
      throw new NotFoundException(`Không tìm thấy phiếu xuất trả nhà cung cấp với ID ${id}.`);
    }
    return doc;
  }
}
