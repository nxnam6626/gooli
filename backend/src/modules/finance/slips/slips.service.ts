import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSlipDto } from './dto/create-slip.dto';
import { SlipType, PartnerType, PaymentStatus, UserRole } from '@prisma/client';

@Injectable()
export class SlipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSlipDto, userId: number) {
    const { partnerId, type, amount, receiptId, exportId, paymentMethod, note } = dto;

    // 1. Validate Partner exists and has correct type
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) {
      throw new NotFoundException(`Không tìm thấy đối tác với ID ${partnerId}.`);
    }

    if (type === SlipType.PAYMENT && partner.type !== PartnerType.SUPPLIER) {
      throw new BadRequestException('Phiếu chi (PAYMENT) chỉ áp dụng cho nhà cung cấp (SUPPLIER).');
    }
    if (type === SlipType.RECEIPT && partner.type !== PartnerType.CUSTOMER) {
      throw new BadRequestException('Phiếu thu (RECEIPT) chỉ áp dụng cho khách hàng (CUSTOMER).');
    }

    // 2. Start atomic transaction
    return this.prisma.$transaction(async (tx) => {
      // Lock partner row for update to serialize all cash flow slips for this partner
      await tx.$executeRaw`SELECT id FROM "Partner" WHERE id = ${partnerId} FOR UPDATE`;

      // Handle Direct linked payment
      if (receiptId) {
        await this.handleDirectPayment(tx.receipt, receiptId, partnerId, amount, SlipType.PAYMENT, type, 'phiếu nhập kho');
      } else if (exportId) {
        await this.handleDirectPayment(tx.export, exportId, partnerId, amount, SlipType.RECEIPT, type, 'phiếu xuất kho');
      }
      // Handle Independent payment (FIFO Allocation)
      else {
        const model = type === SlipType.PAYMENT ? tx.receipt : tx.export;
        await this.allocateFifo(model, partnerId, amount);
      }

      // 3. Decrement Partner totalDebt
      await tx.partner.update({
        where: { id: partnerId },
        data: { totalDebt: { decrement: amount } },
      });

      // 4. Generate unique voucher code
      const finalCode = dto.code?.trim() || (await this.generateSlipCode(tx, type));

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

  async remove(id: number, currentUser: { id: number; role: string }) {
    const slip = await this.prisma.paymentSlip.findUnique({
      where: { id },
    });
    if (!slip) {
      throw new NotFoundException(`Không tìm thấy phiếu thu/chi với ID ${id}.`);
    }

    // Rule: Slip chỉ được xóa trong vòng 24 giờ sau khi tạo, HOẶC người xóa phải là ADMIN
    const hoursSinceCreation = (Date.now() - new Date(slip.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24 && currentUser.role !== UserRole.ADMIN) {
      throw new BadRequestException('Không thể xóa phiếu thu/chi đã tạo quá 24 giờ. Chỉ ADMIN mới có quyền này.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Revert partner debt (increment it back)
      await tx.partner.update({
        where: { id: slip.partnerId },
        data: { totalDebt: { increment: slip.amount } },
      });

      // Revert receipt payment status
      if (slip.receiptId) {
        await this.revertBillPayment(tx.receipt, slip.receiptId, Number(slip.amount));
      }

      // Revert export payment status
      if (slip.exportId) {
        await this.revertBillPayment(tx.export, slip.exportId, Number(slip.amount));
      }

      // Delete the slip
      return tx.paymentSlip.delete({ where: { id } });
    });
  }

  // ─── PRIVATE HELPER METHODS ──────────────────────────────────────────────────

  private getPaymentStatus(paidAmount: number, total: number): PaymentStatus {
    if (paidAmount <= 0) return PaymentStatus.UNPAID;
    if (paidAmount >= total) return PaymentStatus.PAID;
    return PaymentStatus.PARTIALLY_PAID;
  }

  private async generateSlipCode(tx: any, type: SlipType): Promise<string> {
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
    return `${prefix}-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
  }

  private async handleDirectPayment(
    txModel: any,
    billId: number,
    partnerId: number,
    amount: number,
    expectedType: SlipType,
    type: SlipType,
    entityName: string,
  ) {
    if (type !== expectedType) {
      throw new BadRequestException(
        `Liên kết với ${entityName} chỉ được dùng cho Phiếu ${expectedType === SlipType.RECEIPT ? 'thu (RECEIPT)' : 'chi (PAYMENT)'}.`,
      );
    }
    const bill = await txModel.findUnique({ where: { id: billId } });
    if (!bill) {
      throw new NotFoundException(`Không tìm thấy ${entityName} với ID ${billId}.`);
    }
    if (bill.partnerId !== partnerId) {
      throw new BadRequestException(`${entityName} này không thuộc đối tác được chọn.`);
    }

    const updatedBill = await txModel.update({
      where: { id: billId },
      data: { paidAmount: { increment: amount } },
    });

    const newPaidAmount = Number(updatedBill.paidAmount);
    if (newPaidAmount > Number(updatedBill.postTaxTotal)) {
      throw new ConflictException(
        `Số tiền ${type === SlipType.RECEIPT ? 'thu' : 'chi'} (${amount.toLocaleString('vi-VN')}đ) vượt quá dư nợ còn lại của hóa đơn (${(
          Number(updatedBill.postTaxTotal) - (newPaidAmount - amount)
        ).toLocaleString('vi-VN')}đ).`,
      );
    }

    await txModel.update({
      where: { id: billId },
      data: { paymentStatus: this.getPaymentStatus(newPaidAmount, Number(updatedBill.postTaxTotal)) },
    });
  }

  private async allocateFifo(txModel: any, partnerId: number, amount: number) {
    let remainAmount = amount;
    const unpaidBills = await txModel.findMany({
      where: {
        partnerId,
        paymentStatus: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID] },
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const bill of unpaidBills) {
      if (remainAmount <= 0) break;

      const currentDebt = Number(bill.postTaxTotal) - Number(bill.paidAmount);
      const toPay = Math.min(remainAmount, currentDebt);
      const newPaidAmount = Number(bill.paidAmount) + toPay;

      await txModel.update({
        where: { id: bill.id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: this.getPaymentStatus(newPaidAmount, Number(bill.postTaxTotal)),
        },
      });
      remainAmount -= toPay;
    }
  }

  private async revertBillPayment(txModel: any, billId: number, amount: number) {
    const bill = await txModel.findUnique({ where: { id: billId } });
    if (bill) {
      const newPaidAmount = Math.max(0, Number(bill.paidAmount) - amount);
      await txModel.update({
        where: { id: billId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: this.getPaymentStatus(newPaidAmount, Number(bill.postTaxTotal)),
        },
      });
    }
  }
}
