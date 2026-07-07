import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerType } from '@prisma/client';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const {
      code,
      name,
      type,
      phone,
      email,
      address,
      taxCode,
      partnerGroupId,
      totalDebt,
      discountRate,
      note,
    } = createPartnerDto;

    const existing = await this.prisma.partner.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException(`Mã đối tác "${code}" đã tồn tại.`);
    }

    return this.prisma.partner.create({
      data: {
        code,
        name,
        type,
        phone,
        email,
        address,
        taxCode,
        partnerGroupId,
        totalDebt,
        discountRate,
        note,
      },
      include: {
        partnerGroup: true,
      },
    });
  }

  async findAll(query: {
    search?: string;
    type?: PartnerType;
    page?: number;
    limit?: number;
    partnerGroupId?: number;
    status?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.PartnerWhereInput = {};

    if (query.status === 'ACTIVE') {
      where.isActive = true;
    } else if (query.status === 'INACTIVE') {
      where.isActive = false;
    } else if (query.status === 'ALL') {
    } else {
      where.isActive = true;
    }

    if (query.partnerGroupId) {
      where.partnerGroupId = Number(query.partnerGroupId);
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.partner.count({ where }),
      this.prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        include: {
          partnerGroup: true,
        },
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
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        partnerGroup: true,
      },
    });
    if (!partner) {
      throw new NotFoundException(`Không tìm thấy đối tác với ID ${id}.`);
    }
    return partner;
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto) {
    const partner = await this.findOne(id);

    if (updatePartnerDto.code && updatePartnerDto.code !== partner.code) {
      const existing = await this.prisma.partner.findUnique({
        where: { code: updatePartnerDto.code },
      });
      if (existing) {
        throw new ConflictException(
          `Mã đối tác "${updatePartnerDto.code}" đã tồn tại.`,
        );
      }
    }

    return this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
      include: {
        partnerGroup: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const receiptsCount = await this.prisma.receipt.count({
      where: { partnerId: id },
    });
    const exportsCount = await this.prisma.export.count({
      where: { partnerId: id },
    });

    if (receiptsCount > 0 || exportsCount > 0) {
      return this.prisma.partner.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.partner.delete({
      where: { id },
    });
  }
}
