import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.unit.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; name: string }) {
    const exists = await this.prisma.unit.findUnique({ where: { code: data.code } });
    if (exists) throw new ConflictException(`Mã đơn vị tính "${data.code}" đã tồn tại.`);
    return this.prisma.unit.create({ data });
  }

  async update(id: number, data: { code?: string; name?: string }) {
    await this.findOne(id);
    return this.prisma.unit.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.unit.delete({ where: { id } });
  }

  private async findOne(id: number) {
    const item = await this.prisma.unit.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Đơn vị tính #${id} không tồn tại.`);
    return item;
  }
}
