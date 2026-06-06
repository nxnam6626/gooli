import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    const { code, name, zone, row, shelf, position, description } =
      createLocationDto;

    const existing = await this.prisma.warehouseLocation.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException(`Mã vị trí kho "${code}" đã tồn tại.`);
    }

    return this.prisma.warehouseLocation.create({
      data: {
        code,
        name,
        zone,
        row,
        shelf,
        position,
        description,
      },
    });
  }

  async findAll(query: {
    search?: string;
    zone?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.zone) {
      where.zone = query.zone;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.warehouseLocation.count({ where }),
      this.prisma.warehouseLocation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async findOne(id: number) {
    const location = await this.prisma.warehouseLocation.findUnique({
      where: { id },
    });
    if (!location) {
      throw new NotFoundException(`Không tìm thấy vị trí kho với ID ${id}.`);
    }
    return location;
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    const location = await this.findOne(id);

    if (updateLocationDto.code && updateLocationDto.code !== location.code) {
      const existing = await this.prisma.warehouseLocation.findUnique({
        where: { code: updateLocationDto.code },
      });
      if (existing) {
        throw new ConflictException(
          `Mã vị trí kho "${updateLocationDto.code}" đã tồn tại.`,
        );
      }
    }

    return this.prisma.warehouseLocation.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Kiểm tra xem có hàng hóa nào đang nằm ở vị trí này không
    const occupiedStocks = await this.prisma.productLocationStock.findFirst({
      where: {
        locationId: id,
        quantity: { gt: 0 },
      },
    });

    if (occupiedStocks) {
      throw new BadRequestException(
        'Không thể xóa vị trí kho đang có hàng hóa lưu trữ.',
      );
    }

    // Kiểm tra lịch sử phiếu nhập/xuất liên quan
    const receiptItemsCount = await this.prisma.receiptItem.count({
      where: { warehouseLocationId: id },
    });
    const exportItemsCount = await this.prisma.exportItem.count({
      where: { warehouseLocationId: id },
    });

    if (receiptItemsCount > 0 || exportItemsCount > 0) {
      // Nếu đã có lịch sử giao dịch thì ẩn đi chứ không xóa cứng
      return this.prisma.warehouseLocation.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.warehouseLocation.delete({
      where: { id },
    });
  }
}
