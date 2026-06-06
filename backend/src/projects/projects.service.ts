import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { generateSlug } from '../categories/categories.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const slug = generateSlug(createProjectDto.name);
    const existing = await this.prisma.project.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Dự án với tên này đã tồn tại.');
    }

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        slug,
        imageUrl: createProjectDto.imageUrl,
        description: createProjectDto.description,
        location: createProjectDto.location,
      },
    });
  }

  async findAll(query?: { search?: string; location?: string }) {
    const where: Prisma.ProjectWhereInput = { isActive: true };

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án với ID ${id}.`);
    }
    return project;
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
    });
    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án với slug ${slug}.`);
    }
    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);

    let slug: string | undefined;
    if (updateProjectDto.name) {
      slug = generateSlug(updateProjectDto.name);
      const existing = await this.prisma.project.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException('Tên dự án mới tạo ra slug đã tồn tại.');
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        name: updateProjectDto.name,
        imageUrl: updateProjectDto.imageUrl,
        description: updateProjectDto.description,
        location: updateProjectDto.location,
        isActive: updateProjectDto.isActive,
        ...(slug ? { slug } : {}),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
