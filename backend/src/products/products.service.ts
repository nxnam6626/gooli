import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateSlug } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const {
      categoryId,
      sku,
      name,
      pricePerM2,
      imageUrl,
      description,
      thickness,
      width,
      length,
      unit,
    } = createProductDto;

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Không tìm thấy danh mục với ID ${categoryId}.`,
      );
    }

    const existingSku = await this.prisma.product.findUnique({
      where: { sku },
    });
    if (existingSku) {
      throw new ConflictException(`Mã SKU "${sku}" này đã tồn tại.`);
    }

    const slug = generateSlug(name);
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException('Sản phẩm với tên hoặc slug này đã tồn tại.');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          categoryId,
          sku,
          name,
          slug,
          pricePerM2,
          imageUrl,
          description,
          thickness,
          width,
          length,
          unit: unit || 'tấm',
          stock: {
            create: {
              quantity: 0,
            },
          },
        },
        include: {
          stock: true,
          category: true,
        },
      });
      return product;
    });
  }

  async findAll(query: {
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.categoryId) {
      where.categoryId = Number(query.categoryId);
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: { name: true, slug: true },
          },
          stock: {
            select: { quantity: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: items.map((item) => ({
        ...item,
        stock: item.stock?.quantity ?? 0,
      })),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stock: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}.`);
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: true,
        stock: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug: ${slug}`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          id: { not: id },
        },
      });
      if (existingSku) {
        throw new ConflictException(
          `Mã SKU "${updateProductDto.sku}" đã tồn tại trên một sản phẩm khác.`,
        );
      }
    }

    let slug: string | undefined;
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      slug = generateSlug(updateProductDto.name);
      const existing = await this.prisma.product.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException(
          'Sản phẩm mới trùng slug với sản phẩm khác.',
        );
      }
    }

    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Không tìm thấy danh mục với ID ${updateProductDto.categoryId}.`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        slug,
      },
      include: {
        category: true,
        stock: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const receiptsCount = await this.prisma.receiptItem.count({
      where: { productId: id },
    });
    const exportsCount = await this.prisma.exportItem.count({
      where: { productId: id },
    });

    if (receiptsCount > 0 || exportsCount > 0) {
      return this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
