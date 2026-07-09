import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PartnerType, SlipType } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getDebtSummary() {
    const customers = await this.prisma.partner.findMany({
      where: { type: PartnerType.CUSTOMER, isActive: true },
      select: { totalDebt: true },
    });
    const suppliers = await this.prisma.partner.findMany({
      where: { type: PartnerType.SUPPLIER, isActive: true },
      select: { totalDebt: true },
    });

    const totalReceivable = customers.reduce((sum, c) => sum + Number(c.totalDebt), 0);
    const totalPayable = suppliers.reduce((sum, s) => sum + Number(s.totalDebt), 0);

    return {
      totalReceivable,
      totalPayable,
    };
  }

  async getPartnerLedger(partnerId: number) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) {
      throw new NotFoundException(`Không tìm thấy đối tác với ID ${partnerId}.`);
    }

    // Fetch approved receipts (Supplier invoice - increases debt)
    const receipts = await this.prisma.receipt.findMany({
      where: { partnerId, status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch approved exports (Customer invoice - increases debt)
    const exports = await this.prisma.export.findMany({
      where: { partnerId, status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch payment slips (RECEIPT/PAYMENT - decreases debt)
    const slips = await this.prisma.paymentSlip.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'asc' },
    });

    // Combine into ledger timeline entries
    const entries: {
      id: string;
      date: Date;
      type: 'RECEIPT_BILL' | 'EXPORT_BILL' | 'SLIP';
      code: string;
      description: string;
      increase: number;
      decrease: number;
    }[] = [];

    receipts.forEach((r) => {
      entries.push({
        id: `receipt-${r.id}`,
        date: r.approvedAt || r.createdAt,
        type: 'RECEIPT_BILL',
        code: r.code,
        description: `Nhập kho - Phiếu nhập ${r.code}`,
        increase: Number(r.postTaxTotal),
        decrease: 0,
      });
    });

    exports.forEach((e) => {
      entries.push({
        id: `export-${e.id}`,
        date: e.approvedAt || e.createdAt,
        type: 'EXPORT_BILL',
        code: e.code,
        description: `Xuất kho - Phiếu xuất ${e.code}`,
        increase: Number(e.postTaxTotal),
        decrease: 0,
      });
    });

    slips.forEach((s) => {
      entries.push({
        id: `slip-${s.id}`,
        date: s.createdAt,
        type: 'SLIP',
        code: s.code,
        description: s.type === SlipType.RECEIPT 
          ? `Thu tiền khách hàng (${s.paymentMethod})` 
          : `Trả tiền nhà cung cấp (${s.paymentMethod})`,
        increase: 0,
        decrease: Number(s.amount),
      });
    });

    // Sort by date ascending
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance
    let balance = 0;
    const ledger = entries.map((entry) => {
      balance += entry.increase - entry.decrease;
      return {
        ...entry,
        balance,
      };
    });

    return {
      partner: {
        id: partner.id,
        code: partner.code,
        name: partner.name,
        type: partner.type,
        totalDebt: Number(partner.totalDebt),
      },
      ledger,
    };
  }

  async getCashbook(query: { from?: string; to?: string; method?: string }) {
    const { from, to, method } = query;
    const filterMethod = method === 'CASH' ? 'Tiền mặt' : method === 'BANK_TRANSFER' ? 'Chuyển khoản' : undefined;

    // Calculate opening balance (all slips before 'from' date)
    let openingBalance = 0;
    if (from) {
      const pastSlips = await this.prisma.paymentSlip.findMany({
        where: {
          createdAt: { lt: new Date(from) },
          ...(filterMethod ? { paymentMethod: filterMethod } : {}),
        },
      });
      pastSlips.forEach((s) => {
        if (s.type === SlipType.RECEIPT) {
          openingBalance += Number(s.amount);
        } else {
          openingBalance -= Number(s.amount);
        }
      });
    }

    // Fetch slips in current range
    const slips = await this.prisma.paymentSlip.findMany({
      where: {
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
        ...(filterMethod ? { paymentMethod: filterMethod } : {}),
      },
      include: {
        partner: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Map slips and compute running balance
    let runningBalance = openingBalance;
    const items = slips.map((s) => {
      const amount = Number(s.amount);
      if (s.type === SlipType.RECEIPT) {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      return {
        id: s.id,
        code: s.code,
        type: s.type,
        amount,
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt,
        note: s.note,
        partner: s.partner ? { id: s.partner.id, name: s.partner.name, code: s.partner.code } : null,
        balance: runningBalance,
      };
    });

    return {
      openingBalance,
      closingBalance: runningBalance,
      items,
    };
  }

  async getProfitAndLoss(query: { from?: string; to?: string }) {
    const { from, to } = query;

    // Fetch approved exports in range
    const exports = await this.prisma.export.findMany({
      where: {
        status: 'APPROVED',
        ...(from || to
          ? {
              approvedAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    const categoryBreakdown: Record<number, { id: number; name: string; revenue: number; cost: number; profit: number }> = {};

    exports.forEach((e) => {
      e.items.forEach((item) => {
        const qty = item.quantity;
        const price = Number(item.price);
        const itemRevenue = qty * price;
        
        // Use estimatedCostPrice as the standard cost price for P&L calculations
        const costPrice = Number(item.product.estimatedCostPrice || 0);
        const itemCost = qty * costPrice;

        totalRevenue += itemRevenue;
        totalCost += itemCost;

        const cat = item.product.category;
        if (cat) {
          if (!categoryBreakdown[cat.id]) {
            categoryBreakdown[cat.id] = {
              id: cat.id,
              name: cat.name,
              revenue: 0,
              cost: 0,
              profit: 0,
            };
          }
          categoryBreakdown[cat.id].revenue += itemRevenue;
          categoryBreakdown[cat.id].cost += itemCost;
          categoryBreakdown[cat.id].profit += (itemRevenue - itemCost);
        }
      });
    });

    return {
      summary: {
        revenue: totalRevenue,
        cost: totalCost,
        profit: totalRevenue - totalCost,
        margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      },
      categories: Object.values(categoryBreakdown),
    };
  }
}
