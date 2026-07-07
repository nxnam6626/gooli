import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Generates unique export codes in the format XK-YYYYMMDD-XXX.
 * Uses an exclusive table lock to prevent duplicate codes under concurrent requests.
 *
 * Placed at the inventory/ level so it lives in the shared domain logic space.
 */
@Injectable()
export class ExportCodeGeneratorService {
  async generate(tx: Prisma.TransactionClient): Promise<string> {
    // Lock table to prevent concurrent transactions from counting at the same time
    await tx.$executeRawUnsafe('LOCK TABLE "Export" IN EXCLUSIVE MODE');

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const countToday = await tx.export.count({
      where: { createdAt: { gte: todayStart } },
    });

    return `XK-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
  }
}
