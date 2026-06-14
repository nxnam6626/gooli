import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSlipDto } from './dto/create-slip.dto';
import { SlipType, PartnerType, PaymentStatus } from '@prisma/client';

@Injectable()
export class SlipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSlipDto, userId: number) {
    const {
      partnerId,
      type,
      amount,
      receiptId,
      exportId,
      paymentMethod,
      note,
    } = dto;

    // 1. Validate Partner exists and has correct type
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) {
      throw new NotFoundException(
        `Không tìm thấy đối tác với ID ${partnerId}.`,
      );
    }

    if (type === SlipType.PAYMENT && partner.type !== PartnerType.SUPPLIER) {
      throw new BadRequestException(
        'Phiếu chi (PAYMENT) chỉ áp dụng cho nhà cung cấp (SUPPLIER).',
      );
    }
    if (type === SlipType.RECEIPT && partner.type !== PartnerType.CUSTOMER) {
      throw new BadRequestException(
        'Phiếu thu (RECEIPT) chỉ áp dụng cho khách hàng (CUSTOMER).',
      );
    }

    // 2. Start atomic transaction
    return this.prisma.$transaction(async (tx) => {
      let remainAmount = amount;

      // Handle Direct linked payment
      if (receiptId) {
        if (type !== SlipType.PAYMENT) {
          throw new BadRequestException(
            'Liên kết với hóa đơn nhập kho (Receipt) chỉ được dùng cho Phiếu chi (PAYMENT).',
          );
        }
        const receipt = await tx.receipt.findUnique({
          where: { id: receiptId },
        });
        if (!receipt) {
          throw new NotFoundException(
            `Không tìm thấy phiếu nhập kho với ID ${receiptId}.`,
          );
        }
        if (receipt.partnerId !== partnerId) {
          throw new BadRequestException(
            'Phiếu nhập kho này không thuộc đối tác được chọn.',
          );
        }

        const currentDebt =
          Number(receipt.postTaxTotal) - Number(receipt.paidAmount);
        if (amount > currentDebt) {
          throw new BadRequestException(
            `Số tiền chi (${amount.toLocaleString('vi-VN')}đ) vượt quá dư nợ còn lại của hóa đơn (${currentDebt.toLocaleString('vi-VN')}đ).`,
          );
        }

        const newPaidAmount = Number(receipt.paidAmount) + amount;
        await tx.receipt.update({
          where: { id: receiptId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus:
              newPaidAmount >= Number(receipt.postTaxTotal)
                ? PaymentStatus.PAID
                : PaymentStatus.PARTIALLY_PAID,
          },
        });
      } else if (exportId) {
        if (type !== SlipType.RECEIPT) {
          throw new BadRequestException(
            'Liên kết với hóa đơn xuất kho (Export) chỉ được dùng cho Phiếu thu (RECEIPT).',
          );
        }
        const exportBill = await tx.export.findUnique({
          where: { id: exportId },
        });
        if (!exportBill) {
          throw new NotFoundException(
            `Không tìm thấy phiếu xuất kho với ID ${exportId}.`,
          );
        }
        if (exportBill.partnerId !== partnerId) {
          throw new BadRequestException(
            'Phiếu xuất kho này không thuộc đối tác được chọn.',
          );
        }

        const currentDebt =
          Number(exportBill.postTaxTotal) - Number(exportBill.paidAmount);
        if (amount > currentDebt) {
          throw new BadRequestException(
            `Số tiền thu (${amount.toLocaleString('vi-VN')}đ) vượt quá dư nợ còn lại của hóa đơn (${currentDebt.toLocaleString('vi-VN')}đ).`,
          );
        }

        const newPaidAmount = Number(exportBill.paidAmount) + amount;
        await tx.export.update({
          where: { id: exportId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus:
              newPaidAmount >= Number(exportBill.postTaxTotal)
                ? PaymentStatus.PAID
                : PaymentStatus.PARTIALLY_PAID,
          },
        });
      }
      // Handle Independent payment (FIFO Allocation)
      else {
        if (type === SlipType.PAYMENT) {
          // Pay off supplier receipts FIFO
          const unpaidReceipts = await tx.receipt.findMany({
            where: {
              partnerId,
              paymentStatus: {
                in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID],
              },
            },
            orderBy: { createdAt: 'asc' },
          });

          for (const receipt of unpaidReceipts) {
            if (remainAmount <= 0) break;

            const currentDebt =
              Number(receipt.postTaxTotal) - Number(receipt.paidAmount);
            if (remainAmount >= currentDebt) {
              await tx.receipt.update({
                where: { id: receipt.id },
                data: {
                  paidAmount: receipt.postTaxTotal,
                  paymentStatus: PaymentStatus.PAID,
                },
              });
              remainAmount -= currentDebt;
            } else {
              await tx.receipt.update({
                where: { id: receipt.id },
                data: {
                  paidAmount: Number(receipt.paidAmount) + remainAmount,
                  paymentStatus: PaymentStatus.PARTIALLY_PAID,
                },
              });
              remainAmount = 0;
            }
          }
        } else {
          // Collect customer exports FIFO
          const unpaidExports = await tx.export.findMany({
            where: {
              partnerId,
              paymentStatus: {
                in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID],
              },
            },
            orderBy: { createdAt: 'asc' },
          });

          for (const exportBill of unpaidExports) {
            if (remainAmount <= 0) break;

            const currentDebt =
              Number(exportBill.postTaxTotal) - Number(exportBill.paidAmount);
            if (remainAmount >= currentDebt) {
              await tx.export.update({
                where: { id: exportBill.id },
                data: {
                  paidAmount: exportBill.postTaxTotal,
                  paymentStatus: PaymentStatus.PAID,
                },
              });
              remainAmount -= currentDebt;
            } else {
              await tx.export.update({
                where: { id: exportBill.id },
                data: {
                  paidAmount: Number(exportBill.paidAmount) + remainAmount,
                  paymentStatus: PaymentStatus.PARTIALLY_PAID,
                },
              });
              remainAmount = 0;
            }
          }
        }
      }

      // 3. Decrement Partner totalDebt
      await tx.partner.update({
        where: { id: partnerId },
        data: {
          totalDebt: { decrement: amount },
        },
      });

      // 4. Generate unique voucher code: PT-YYYYMMDD-XXX / PC-YYYYMMDD-XXX
      let finalCode = dto.code?.trim();
      if (!finalCode) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const todayStart = new Date(today.setHours(0, 0, 0, 0));

        const countToday = await tx.paymentSlip.count({
          where: {
            type,
            createdAt: { gte: todayStart },
          },
        });

        const prefix = type === SlipType.RECEIPT ? 'PT' : 'PC';
        finalCode = `${prefix}-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
      }

      // 5. Create PaymentSlip
      return tx.paymentSlip.create({
        data: {
          code: finalCode,
          type,
          partnerId,
          receiptId: receiptId || null,
          exportId: exportId || null,
          amount,
          paymentMethod,
          note,
          createdById: userId,
        },
        include: {
          partner: true,
          receipt: true,
          export: true,
        },
      });
    });
  }

  async findAll() {
    return this.prisma.paymentSlip.findMany({
      include: {
        partner: true,
        receipt: true,
        export: true,
        createdByUser: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const slip = await this.prisma.paymentSlip.findUnique({
      where: { id },
      include: {
        partner: true,
        receipt: true,
        export: true,
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    });
    if (!slip) {
      throw new NotFoundException(`Không tìm thấy phiếu thu/chi với ID ${id}.`);
    }
    return slip;
  }
}
