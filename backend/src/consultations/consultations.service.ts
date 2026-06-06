import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createConsultationDto: CreateConsultationDto) {
    return this.prisma.consultation.create({
      data: {
        email: createConsultationDto.email,
        phone: createConsultationDto.phone,
        note: createConsultationDto.note,
      },
    });
  }

  async findAll() {
    return this.prisma.consultation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.consultation.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(
        `Không tìm thấy yêu cầu tư vấn với ID ${id}.`,
      );
    }
    return item;
  }

  async process(id: number) {
    await this.findOne(id);
    return this.prisma.consultation.update({
      where: { id },
      data: { isProcessed: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.consultation.delete({
      where: { id },
    });
  }
}
