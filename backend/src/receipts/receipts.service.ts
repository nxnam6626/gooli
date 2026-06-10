import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { TransactionStatus } from '@prisma/client';
import { RevalidationService } from '../webhook/revalidation.service';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidationService: RevalidationService,
  ) {}

  async create(createReceiptDto: CreateReceiptDto, userId: number) {
    const { note, items } = createReceiptDto;

    // Validate products exist
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với ID ${item.productId}.`,
        );
      }
    }

    // Generate unique code: NK-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(today.setHours(0, 0, 0, 0));

    const countToday = await this.prisma.receipt.count({
      where: {
        createdAt: { gte: todayStart },
      },
    });
    const code = `NK-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

    const revalidateQueue: { slug: string; oldQty: number; newQty: number }[] = [];

    const receipt = await this.prisma.$transaction(async (tx) => {
      // Create receipt with APPROVED status
      const createdReceipt = await tx.receipt.create({
        data: {
          code,
          note,
          createdById: userId,
          approvedById: userId, // Auto approved
          approvedAt: new Date(),
          partnerId: createReceiptDto.partnerId,
          status: TransactionStatus.APPROVED,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              warehouseLocationId: item.warehouseLocationId,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, slug: true },
              },
            },
          },
        },
      });

      // Update Stock
      for (const item of createdReceipt.items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
          include: { product: true },
        });

        const oldQty = stock ? stock.quantity : 0;
        const newQty = oldQty + item.quantity;

        await tx.stock.upsert({
          where: { productId: item.productId },
          create: {
            productId: item.productId,
            quantity: item.quantity,
          },
          update: {
            quantity: { increment: item.quantity },
          },
        });

        // Update ProductLocationStock if location provided
        if (item.warehouseLocationId) {
          await tx.productLocationStock.upsert({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: item.warehouseLocationId,
              },
            },
            create: {
              productId: item.productId,
              locationId: item.warehouseLocationId,
              quantity: item.quantity,
            },
            update: {
              quantity: { increment: item.quantity },
            },
          });
        }

        revalidateQueue.push({
          slug: item.product.slug,
          oldQty,
          newQty,
        });
      }

      return createdReceipt;
    });

    // Fire revalidation
    for (const task of revalidateQueue) {
      this.revalidationService.checkAndTrigger(
        task.slug,
        task.oldQty,
        task.newQty,
      );
    }

    return receipt;
  }

  async findAll() {
    return this.prisma.receipt.findMany({
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true },
            },
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
          include: {
            product: {
              select: { name: true, slug: true },
            },
          },
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

    if (receipt.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Phiếu nhập kho này đã được duyệt hoặc từ chối.',
      );
    }

    const revalidateQueue: { slug: string; oldQty: number; newQty: number }[] =
      [];

    await this.prisma.$transaction(async (tx) => {
      for (const item of receipt.items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
          include: { product: true },
        });

        if (!stock) {
          throw new NotFoundException(
            `Không tìm thấy dữ liệu kho cho sản phẩm ID ${item.productId}.`,
          );
        }

        const oldQty = stock.quantity;
        const newQty = oldQty + item.quantity;

        await tx.stock.update({
          where: { productId: item.productId },
          data: { quantity: { increment: item.quantity } },
        });

        revalidateQueue.push({
          slug: stock.product.slug,
          oldQty,
          newQty,
        });
      }

      await tx.receipt.update({
        where: { id },
        data: {
          status: TransactionStatus.APPROVED,
          approvedById,
          approvedAt: new Date(),
        },
      });
    });

    // Gọi revalidate sau khi transaction commit thành công
    for (const task of revalidateQueue) {
      this.revalidationService.checkAndTrigger(
        task.slug,
        task.oldQty,
        task.newQty,
      );
    }

    return this.findOne(id);
  }

  async reject(id: number, approvedById: number) {
    const receipt = await this.findOne(id);

    if (receipt.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Phiếu nhập kho này đã được duyệt hoặc từ chối.',
      );
    }

    return this.prisma.receipt.update({
      where: { id },
      data: {
        status: TransactionStatus.REJECTED,
        approvedById,
        approvedAt: new Date(),
      },
      include: {
        items: true,
      },
    });
  }
}
