import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  PRODUCT_INCLUDE,
  ensureCategoryExists,
  ensureSkuUnique,
  buildPublicCategoriesWrite,
  generateUniqueSlug,
  buildFindAllWhereInput,
  mapProductResponse,
} from './products.helpers';

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

    await ensureCategoryExists(this.prisma, categoryId);
    await ensureSkuUnique(this.prisma, sku);

    const slug = await generateUniqueSlug(this.prisma, name);

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
          publicCategories: buildPublicCategoriesWrite(publicCategoryIds),
        },
        include: PRODUCT_INCLUDE,
      });
      return mapProductResponse(product);
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

    const where = await buildFindAllWhereInput(this.prisma, query);

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: items.map((item) => mapProductResponse(item)),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}.`);
    }
    return mapProductResponse(product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: PRODUCT_INCLUDE,
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug: ${slug}`);
    }
    return mapProductResponse(product);
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
      await ensureSkuUnique(this.prisma, restDto.sku, id);
    }

    let slug: string | undefined;
    if (restDto.name && restDto.name !== product.name) {
      slug = await generateUniqueSlug(this.prisma, restDto.name, id);
    }

    if (restDto.categoryId) {
      await ensureCategoryExists(this.prisma, restDto.categoryId);
    }

    const data = {
      ...restDto,
      slug,
      publicCategories: buildPublicCategoriesWrite(publicCategoryIds, true),
    };

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: PRODUCT_INCLUDE,
    });

    return mapProductResponse(updated);
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
