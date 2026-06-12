import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyInfoService {
  constructor(private prisma: PrismaService) {}

  async get() {
    return this.prisma.companyInfo.findFirst();
  }

  async upsert(data: {
    code: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    note?: string;
    auditDate?: string;
    inventoryDate?: string;
  }) {
    const existing = await this.prisma.companyInfo.findFirst();
    const payload = {
      code: data.code,
      name: data.name,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      taxCode: data.taxCode ?? null,
      note: data.note ?? null,
      auditDate: data.auditDate ? new Date(data.auditDate) : null,
      inventoryDate: data.inventoryDate ? new Date(data.inventoryDate) : null,
    };

    if (existing) {
      return this.prisma.companyInfo.update({ where: { id: existing.id }, data: payload });
    }
    return this.prisma.companyInfo.create({ data: payload });
  }
}
