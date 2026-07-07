import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Handles all stock increment operations via upsert.
 * Centralised here so the faulty/non-faulty branching logic lives in exactly one place.
 *
 * Exported from ReceiptsModule so future modules (e.g. ExportsModule) can
 * inject it without duplicating the logic.
 */
@Injectable()
export class StockUpdaterService {
  async applyIncrement(
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
