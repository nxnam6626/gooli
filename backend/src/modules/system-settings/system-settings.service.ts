import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const records = await this.prisma.systemSetting.findMany();
    const result: Record<string, any> = {};
    for (const record of records) {
      try {
        // Parse JSON-like values (objects, arrays, booleans, numbers)
        result[record.key] = JSON.parse(record.value);
      } catch {
        // Fallback to raw string value
        result[record.key] = record.value;
      }
    }
    return result;
  }

  async updateAll(settings: Record<string, any>) {
    return this.prisma.$transaction(
      Object.entries(settings).map(([key, value]) => {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        return this.prisma.systemSetting.upsert({
          where: { key },
          update: { value: stringValue },
          create: { key, value: stringValue },
        });
      }),
    );
  }
}
