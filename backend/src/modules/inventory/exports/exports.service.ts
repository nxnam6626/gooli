import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExportDto } from './dto/create-export.dto';
import { TransactionCodeGeneratorService } from '../shared/services/transaction-code-generator.service';
import { StockUpdaterService } from '../shared/services/stock-updater.service';

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: TransactionCodeGeneratorService,
    private readonly stockUpdater: StockUpdaterService,
  ) {}

  async create(createExportDto: CreateExportDto, userId: number) {
    const { note, items } = createExportDto;

    // Batch-validate all product IDs in one query
    const foundIds = new Set(
      (
        await this.prisma.product.findMany({
          where: { id: { in: items.map((i) => i.productId) } },
          select: { id: true },
        })
      ).map((p) => p.id),
    );

    for (const item of items) {
      if (!foundIds.has(item.productId)) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với ID ${item.productId}.`,
        );
      }
    }

    let retries = 10;
    while (retries > 0) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const code = await this.codeGenerator.generate('XK', tx);

          return await tx.export.create({
            data: {
              code,
              note,
              createdById: userId,
              status: TransactionStatus.PENDING,
              items: {
                create: items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
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
        });
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
          retries--;
          if (retries === 0) {
            throw new ConflictException(
              'Không thể tạo mã phiếu xuất kho duy nhất sau nhiều lần thử do xung đột dữ liệu.',
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
    throw new ConflictException('Không thể tạo mã phiếu xuất kho duy nhất sau nhiều lần thử.');
  }

  async findAll() {
    return this.prisma.export.findMany({
      include: {
        items: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.export.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
    });
    if (!record) {
      throw new NotFoundException(`Không tìm thấy phiếu xuất kho với ID ${id}.`);
    }
    return record;
  }

  async approve(id: number, approvedById: number) {
    const record = await this.prisma.export.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!record) {
      throw new NotFoundException(`Không tìm thấy phiếu xuất kho với ID ${id}.`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Conditional status update to prevent race conditions during concurrent approval
      const result = await tx.export.updateMany({
        where: { id, status: TransactionStatus.PENDING },
        data: { status: TransactionStatus.APPROVED, approvedById, approvedAt: new Date() },
      });

      if (result.count === 0) {
        throw new ConflictException('Phiếu xuất kho này đã được xử lý (duyệt hoặc từ chối) bởi người khác.');
      }

      for (const item of record.items) {
        await this.stockUpdater.applyDecrement(
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
    // Ensure the record exists first
    await this.findOne(id);

    // Conditional status update to prevent race conditions during concurrent reject
    const result = await this.prisma.export.updateMany({
      where: { id, status: TransactionStatus.PENDING },
      data: { status: TransactionStatus.REJECTED, approvedById, approvedAt: new Date() },
    });

    if (result.count === 0) {
      throw new ConflictException('Phiếu xuất kho này đã được xử lý (duyệt hoặc từ chối) bởi người khác.');
    }

    return this.prisma.export.findUnique({
      where: { id },
      include: { items: true },
    });
  }
}
