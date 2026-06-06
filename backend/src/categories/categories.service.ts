import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export function generateSlug(str: string): string {
  str = str.toLowerCase();
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[đĐ]/g, 'd');
  str = str.replace(/([^a-z0-9\s-]+)/g, '');
  str = str.replace(/([\s-]+)/g, '-');
  return str.trim().replace(/^-+|-+$/g, '');
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = generateSlug(createCategoryDto.name);

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Danh mục với tên hoặc slug này đã tồn tại.');
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}.`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    let slug: string | undefined;
    if (updateCategoryDto.name) {
      slug = generateSlug(updateCategoryDto.name);
      const existing = await this.prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException('Tên danh mục mới tạo ra slug đã tồn tại.');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        slug,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (productsCount > 0) {
      throw new ConflictException('Không thể xóa danh mục đã chứa sản phẩm.');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
