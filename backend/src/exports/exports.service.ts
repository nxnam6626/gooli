import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExportDto } from './dto/create-export.dto';
import { TransactionStatus } from '@prisma/client';
import { RevalidationService } from '../webhook/revalidation.service';

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidationService: RevalidationService,
  ) {}

  async create(createExportDto: CreateExportDto, userId: number) {
    const { note, items } = createExportDto;

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

    // Generate unique code: XK-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(today.setHours(0, 0, 0, 0));

    const countToday = await this.prisma.export.count({
      where: {
        createdAt: { gte: todayStart },
      },
    });
    const code = `XK-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

    return this.prisma.export.create({
      data: {
        code,
        note,
        createdById: userId,
        status: TransactionStatus.PENDING,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
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
  }

  async findAll() {
    return this.prisma.export.findMany({
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
    const exportRecord = await this.prisma.export.findUnique({
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
    if (!exportRecord) {
      throw new NotFoundException(
        `Không tìm thấy phiếu xuất kho với ID ${id}.`,
      );
    }
    return exportRecord;
  }

  async approve(id: number, approvedById: number) {
    const exportRecord = await this.prisma.export.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!exportRecord) {
      throw new NotFoundException(
        `Không tìm thấy phiếu xuất kho với ID ${id}.`,
      );
    }

    if (exportRecord.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Phiếu xuất kho này đã được duyệt hoặc từ chối.',
      );
    }

    const revalidateQueue: { slug: string; oldQty: number; newQty: number }[] =
      [];

    await this.prisma.$transaction(async (tx) => {
      for (const item of exportRecord.items) {
        // Khóa bi quan và lấy giá trị tồn kho mới nhất
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
          include: { product: true },
        });

        if (!stock) {
          throw new NotFoundException(
            `Không tìm thấy dữ liệu kho cho sản phẩm ID ${item.productId}.`,
          );
        }

        if (stock.quantity < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm [${stock.product.name}] không đủ số lượng tồn kho để xuất. Hiện tại: ${stock.quantity}, Yêu cầu: ${item.quantity}.`,
          );
        }

        const oldQty = stock.quantity;
        const newQty = oldQty - item.quantity;

        // Cập nhật nguyên tử với kiểm tra điều kiện (Optimistic Lock Check)
        const updateResult = await tx.stock.updateMany({
          where: {
            productId: item.productId,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            `Race Condition: Sản phẩm [${stock.product.name}] đã bị thay đổi tồn kho bởi giao dịch khác. Vui lòng thử lại.`,
          );
        }

        revalidateQueue.push({
          slug: stock.product.slug,
          oldQty,
          newQty,
        });
      }

      await tx.export.update({
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
    const exportRecord = await this.findOne(id);

    if (exportRecord.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Phiếu xuất kho này đã được duyệt hoặc từ chối.',
      );
    }

    return this.prisma.export.update({
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
