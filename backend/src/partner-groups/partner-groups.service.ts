import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnerGroupsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.partnerGroup.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; name: string }) {
    const exists = await this.prisma.partnerGroup.findUnique({ where: { code: data.code } });
    if (exists) throw new ConflictException(`Mã nhóm đối tác "${data.code}" đã tồn tại.`);
    return this.prisma.partnerGroup.create({ data });
  }

  async update(id: number, data: { code?: string; name?: string }) {
    await this.findOne(id);
    return this.prisma.partnerGroup.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.partnerGroup.delete({ where: { id } });
  }

  private async findOne(id: number) {
    const item = await this.prisma.partnerGroup.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Nhóm đối tác #${id} không tồn tại.`);
    return item;
  }
}
