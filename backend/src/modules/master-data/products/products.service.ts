import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
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
      publicCategoryIds,
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

    let slug = generateSlug(name);
    let attempt = 1;
    let existingSlug = await this.prisma.product.findUnique({
      where: { slug },
    });
    while (existingSlug && attempt <= 3) {
      attempt++;
      slug = `${generateSlug(name)}-${attempt}`;
      existingSlug = await this.prisma.product.findUnique({
        where: { slug },
      });
    }
    if (existingSlug) {
      slug = `${generateSlug(name)}-${Math.floor(1000 + Math.random() * 9000)}`;
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
              faultyQty: 0,
            },
          },
          publicCategories:
            publicCategoryIds && Array.isArray(publicCategoryIds)
              ? {
                  create: publicCategoryIds.map((pubCatId) => ({
                    publicCategory: {
                      connect: { id: Number(pubCatId) },
                    },
                  })),
                }
              : undefined,
        },
        include: {
          stock: true,
          category: true,
          publicCategories: true,
        },
      });
      return {
        ...product,
        publicCategoryIds: product.publicCategories.map(
          (pc) => pc.publicCategoryId,
        ),
      };
    });
  }

  async findAll(query: {
    categoryId?: number;
    publicCategoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (query.categoryId) {
      where.categoryId = Number(query.categoryId);
    }

    if (query.publicCategoryId) {
      const pubCatId = Number(query.publicCategoryId);
      const pubCat = await this.prisma.publicCategory.findUnique({
        where: { id: pubCatId },
      });
      const internalCategoryId = pubCat?.internalCategoryId;

      where.OR = [
        ...(internalCategoryId ? [{ categoryId: internalCategoryId }] : []),
        {
          publicCategories: {
            some: {
              publicCategoryId: pubCatId,
            },
          },
        },
      ];
    }

    if (query.search) {
      const searchInput = {
        contains: query.search,
        mode: 'insensitive' as const,
      };
      if (where.OR) {
        const searchOR = [
          { name: searchInput },
          { sku: searchInput },
          { slug: searchInput },
        ];
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = [
          { name: searchInput },
          { sku: searchInput },
          { slug: searchInput },
        ];
      }
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
            select: { quantity: true, faultyQty: true },
          },
          publicCategories: {
            select: { publicCategoryId: true },
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
        faultyQty: item.stock?.faultyQty ?? 0,
        publicCategoryIds: item.publicCategories.map(
          (pc) => pc.publicCategoryId,
        ),
      })),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stock: true,
        publicCategories: {
          select: { publicCategoryId: true },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}.`);
    }
    return {
      ...product,
      publicCategoryIds: product.publicCategories.map(
        (pc) => pc.publicCategoryId,
      ),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: true,
        stock: true,
        publicCategories: {
          select: { publicCategoryId: true },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug: ${slug}`);
    }
    return {
      ...product,
      publicCategoryIds: product.publicCategories.map(
        (pc) => pc.publicCategoryId,
      ),
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}.`);
    }

    const { publicCategoryIds, ...restDto } = updateProductDto;

    if (restDto.sku && restDto.sku !== product.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku: restDto.sku,
          id: { not: id },
        },
      });
      if (existingSku) {
        throw new ConflictException(
          `Mã SKU "${restDto.sku}" đã tồn tại trên một sản phẩm khác.`,
        );
      }
    }

    let slug: string | undefined;
    if (restDto.name && restDto.name !== product.name) {
      const baseSlug = generateSlug(restDto.name);
      slug = baseSlug;
      let attempt = 1;
      let existing = await this.prisma.product.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      while (existing && attempt <= 3) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
        existing = await this.prisma.product.findFirst({
          where: {
            slug,
            id: { not: id },
          },
        });
      }
      if (existing) {
        slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    if (restDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: restDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Không tìm thấy danh mục với ID ${restDto.categoryId}.`,
        );
      }
    }

    const data: Prisma.ProductUpdateInput = {
      ...restDto,
      slug,
    };

    if (publicCategoryIds && Array.isArray(publicCategoryIds)) {
      data.publicCategories = {
        deleteMany: {},
        create: publicCategoryIds.map((pubCatId) => ({
          publicCategory: {
            connect: { id: Number(pubCatId) },
          },
        })),
      };
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        stock: true,
        publicCategories: {
          select: { publicCategoryId: true },
        },
      },
    });

    return {
      ...updated,
      publicCategoryIds: updated.publicCategories.map(
        (pc) => pc.publicCategoryId,
      ),
    };
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
