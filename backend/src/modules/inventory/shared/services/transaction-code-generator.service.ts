import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Generates unique codes in the format NK-YYYYMMDD-XXX or XK-YYYYMMDD-XXX.
 * Uses an exclusive table lock to prevent duplicate codes under concurrent requests.
 *
 * Centralized under inventory/shared/ to serve both receipts (NK) and exports (XK).
 */
@Injectable()
export class TransactionCodeGeneratorService {
  async generate(
    prefix: 'NK' | 'XK',
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const tableName = prefix === 'NK' ? 'Receipt' : 'Export';
    // Lock table to prevent concurrent transactions from counting at the same time
    await tx.$executeRawUnsafe(`LOCK TABLE "${tableName}" IN EXCLUSIVE MODE`);

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const countToday =
      prefix === 'NK'
        ? await tx.receipt.count({ where: { createdAt: { gte: todayStart } } })
        : await tx.export.count({ where: { createdAt: { gte: todayStart } } });

    return `${prefix}-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;
  }
}
