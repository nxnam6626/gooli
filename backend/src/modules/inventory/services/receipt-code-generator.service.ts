import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Generates unique receipt codes in the format NK-YYYYMMDD-XXX.
 * Uses an exclusive table lock to prevent duplicate codes under concurrent requests.
 *
 * Placed at the inventory/ level so it lives in the shared domain logic space.
 */
@Injectable()
export class ReceiptCodeGeneratorService {
  async generate(tx: Prisma.TransactionClient): Promise<string> {
    // Lock table to prevent concurrent transactions from counting at the same time
    await tx.$executeRawUnsafe('LOCK TABLE "Receipt" IN EXCLUSIVE MODE');

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const countToday = await tx.receipt.count({
      where: { createdAt: { gte: todayStart } },
    });

    return `NK-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
  }
}
