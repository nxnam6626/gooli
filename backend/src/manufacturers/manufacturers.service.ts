import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManufacturersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.manufacturer.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; name: string }) {
    const exists = await this.prisma.manufacturer.findUnique({ where: { code: data.code } });
    if (exists) throw new ConflictException(`Mã hãng sản xuất "${data.code}" đã tồn tại.`);
    return this.prisma.manufacturer.create({ data });
  }

  async update(id: number, data: { code?: string; name?: string }) {
    await this.findOne(id);
    return this.prisma.manufacturer.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.manufacturer.delete({ where: { id } });
  }

  private async findOne(id: number) {
    const item = await this.prisma.manufacturer.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Hãng sản xuất #${id} không tồn tại.`);
    return item;
  }
}
