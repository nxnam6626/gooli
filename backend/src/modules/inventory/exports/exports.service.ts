import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

    return this.prisma.$transaction(async (tx) => {
      const code = await this.codeGenerator.generate('XK', tx);

      return tx.export.create({
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
    if (record.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Phiếu xuất kho này đã được duyệt hoặc từ chối.');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of record.items) {
        await this.stockUpdater.applyDecrement(
          tx,
          item.productId,
          item.quantity,
          item.isFaulty,
        );
      }

      await tx.export.update({
        where: { id },
        data: { status: TransactionStatus.APPROVED, approvedById, approvedAt: new Date() },
      });
    });

    return this.findOne(id);
  }

  async reject(id: number, approvedById: number) {
    const record = await this.findOne(id);

    if (record.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Phiếu xuất kho này đã được duyệt hoặc từ chối.');
    }

    return this.prisma.export.update({
      where: { id },
      data: { status: TransactionStatus.REJECTED, approvedById, approvedAt: new Date() },
      include: { items: true },
    });
  }
}
