import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Handles all stock increment and decrement operations via upsert/update.
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

  async applyDecrement(
    tx: Prisma.TransactionClient,
    productId: number,
    quantity: number,
    isFaulty: boolean,
  ): Promise<void> {
    const stock = await tx.stock.findUnique({
      where: { productId },
      include: { product: true },
    });

    if (!stock) {
      throw new NotFoundException(
        `Không tìm thấy tồn kho cho sản phẩm với ID ${productId}.`,
      );
    }

    if (isFaulty) {
      if (stock.faultyQty < quantity) {
        throw new BadRequestException(
          `Hàng hỏng "${stock.product.name}" không đủ tồn kho (hiện có: ${stock.faultyQty}, cần: ${quantity}).`,
        );
      }
      await tx.stock.update({
        where: { productId },
        data: { faultyQty: { decrement: quantity } },
      });
    } else {
      if (stock.quantity < quantity) {
        throw new BadRequestException(
          `"${stock.product.name}" không đủ tồn kho (hiện có: ${stock.quantity}, cần: ${quantity}).`,
        );
      }
      await tx.stock.update({
        where: { productId },
        data: { quantity: { decrement: quantity } },
      });
    }
  }
}
