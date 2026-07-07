import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { TransactionCodeGeneratorService } from '../shared/services/transaction-code-generator.service';
import { StockUpdaterService } from '../shared/services/stock-updater.service';

/**
 * Handles CRUD operations for receipts (manual create, findAll, findOne, approve, reject).
 * Excel import is handled separately by ReceiptExcelImportService.
 */
@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: TransactionCodeGeneratorService,
    private readonly stockUpdater: StockUpdaterService,
  ) {}

  async create(createReceiptDto: CreateReceiptDto, userId: number) {
    const { note, items } = createReceiptDto;

    // Batch-validate all product IDs in a single query instead of N individual lookups
    const productIds = items.map((item) => item.productId);
    const foundProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const foundIds = new Set(foundProducts.map((p) => p.id));

    for (const item of items) {
      if (!foundIds.has(item.productId)) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với ID ${item.productId}.`,
        );
      }
    }

    const isPending = !!createReceiptDto.expectedDeliveryDate;

    let retries = 10;
    while (retries > 0) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const code = await this.codeGenerator.generate('NK', tx);

          const createdReceipt = await tx.receipt.create({
            data: {
              code,
              note,
              createdById: userId,
              approvedById: isPending ? null : userId,
              approvedAt: isPending ? null : new Date(),
              partnerId: createReceiptDto.partnerId,
              status: isPending
                ? TransactionStatus.PENDING
                : TransactionStatus.APPROVED,
              expectedDeliveryDate: createReceiptDto.expectedDeliveryDate
                ? new Date(createReceiptDto.expectedDeliveryDate)
                : null,
              items: {
                create: items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  vatRate: item.vatRate ?? 0,
                  isFaulty: item.isFaulty ?? false,
                })),
              },
            },
            include: {
              items: {
                include: { product: { select: { name: true, slug: true } } },
              },
            },
          });

          if (!isPending) {
            for (const item of createdReceipt.items) {
              await this.stockUpdater.applyIncrement(
                tx,
                item.productId,
                item.quantity,
                item.isFaulty,
              );
            }
          }

          return createdReceipt;
        });
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
          retries--;
          if (retries === 0) {
            throw new ConflictException(
              'Không thể tạo mã phiếu nhập kho duy nhất sau nhiều lần thử do xung đột dữ liệu.',
            );
          }
          // Exponential backoff: e.g. 2^x * 5ms + random jitter (0-30ms)
          const delayMs = Math.pow(2, 9 - retries) * 5 + Math.random() * 30;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException('Không thể tạo mã phiếu nhập kho duy nhất sau nhiều lần thử.');
  }

  async findAll() {
    return this.prisma.receipt.findMany({
      include: {
        partner: { select: { id: true, name: true, code: true } },
        items: {
          include: {
            product: { select: { name: true, slug: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
    });
    if (!receipt) {
      throw new NotFoundException(
        `Không tìm thấy phiếu nhập kho với ID ${id}.`,
      );
    }
    return receipt;
  }

  async approve(id: number, approvedById: number) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!receipt) {
      throw new NotFoundException(
        `Không tìm thấy phiếu nhập kho với ID ${id}.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Conditional status update to prevent race conditions during concurrent approval
      const result = await tx.receipt.updateMany({
        where: { id, status: TransactionStatus.PENDING },
        data: {
          status: TransactionStatus.APPROVED,
          approvedById,
          approvedAt: new Date(),
        },
      });

      if (result.count === 0) {
        throw new ConflictException(
          'Phiếu nhập kho này đã được xử lý (duyệt hoặc từ chối) bởi người khác.',
        );
      }

      for (const item of receipt.items) {
        await this.stockUpdater.applyIncrement(
          tx,
          item.productId,
          item.quantity,
          item.isFaulty,
        );
      }
    });

    return this.findOne(id);
  }

  async reject(id: number, approvedById: number) {
    // Ensure the receipt exists first
    await this.findOne(id);

    // Conditional status update to prevent race conditions during concurrent reject
    const result = await this.prisma.receipt.updateMany({
      where: { id, status: TransactionStatus.PENDING },
      data: {
        status: TransactionStatus.REJECTED,
        approvedById,
        approvedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new ConflictException(
        'Phiếu nhập kho này đã được xử lý (duyệt hoặc từ chối) bởi người khác.',
      );
    }

    return this.prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });
  }
}
