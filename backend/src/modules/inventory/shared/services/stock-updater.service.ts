import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Handles all stock increment and decrement operations via upsert/update.
 * Centralised here so the faulty/non-faulty branching logic lives in exactly one place.
 *
 * Placed at inventory/shared/ level so both ReceiptsModule and ExportsModule can share it.
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
    if (isFaulty) {
      const result = await tx.stock.updateMany({
        where: {
          productId,
          faultyQty: { gte: quantity },
        },
        data: {
          faultyQty: { decrement: quantity },
        },
      });

      if (result.count === 0) {
        const stock = await tx.stock.findUnique({
          where: { productId },
          include: { product: true },
        });

        if (!stock) {
          throw new NotFoundException(
            `Không tìm thấy tồn kho cho sản phẩm với ID ${productId}.`,
          );
        }
        throw new BadRequestException(
          `Hàng hỏng "${stock.product.name}" không đủ tồn kho (hiện có: ${stock.faultyQty}, cần: ${quantity}).`,
        );
      }
    } else {
      const result = await tx.stock.updateMany({
        where: {
          productId,
          quantity: { gte: quantity },
        },
        data: {
          quantity: { decrement: quantity },
        },
      });

      if (result.count === 0) {
        const stock = await tx.stock.findUnique({
          where: { productId },
          include: { product: true },
        });

        if (!stock) {
          throw new NotFoundException(
            `Không tìm thấy tồn kho cho sản phẩm với ID ${productId}.`,
          );
        }
        throw new BadRequestException(
          `"${stock.product.name}" không đủ tồn kho (hiện có: ${stock.quantity}, cần: ${quantity}).`,
        );
      }
    }
  }
}
