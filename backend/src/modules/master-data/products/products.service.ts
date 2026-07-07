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

const PRODUCT_INCLUDE = {
  category: true,
  stock: true,
  publicCategories: { select: { publicCategoryId: true } },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

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

    await this.ensureCategoryExists(categoryId);
    await this.ensureSkuUnique(sku);

    const slug = await this.generateUniqueSlug(name);

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
          publicCategories: this.buildPublicCategoriesWrite(publicCategoryIds),
        },
        include: PRODUCT_INCLUDE,
      });
      return this.mapProductResponse(product);
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

    const where = await this.buildFindAllWhereInput(query);

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
      items: items.map((item) => this.mapProductResponse(item)),
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
    return this.mapProductResponse(product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: PRODUCT_INCLUDE,
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug: ${slug}`);
    }
    return this.mapProductResponse(product);
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
      await this.ensureSkuUnique(restDto.sku, id);
    }

    let slug: string | undefined;
    if (restDto.name && restDto.name !== product.name) {
      slug = await this.generateUniqueSlug(restDto.name, id);
    }

    if (restDto.categoryId) {
      await this.ensureCategoryExists(restDto.categoryId);
    }

    const data: Prisma.ProductUpdateInput = {
      ...restDto,
      slug,
    };

    if (publicCategoryIds) {
      data.publicCategories = this.buildPublicCategoriesWrite(publicCategoryIds, true);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: PRODUCT_INCLUDE,
    });

    return this.mapProductResponse(updated);
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

  private async ensureCategoryExists(categoryId: number): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${categoryId}.`);
    }
  }

  private async ensureSkuUnique(sku: string, excludeProductId?: number): Promise<void> {
    const existingSku = await this.prisma.product.findFirst({
      where: {
        sku,
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      },
    });
    if (existingSku) {
      throw new ConflictException(
        excludeProductId
          ? `Mã SKU "${sku}" đã tồn tại trên một sản phẩm khác.`
          : `Mã SKU "${sku}" này đã tồn tại.`,
      );
    }
  }

  private buildPublicCategoriesWrite(
    publicCategoryIds?: number[],
    isUpdate = false,
  ) {
    if (!publicCategoryIds || !Array.isArray(publicCategoryIds)) {
      return undefined;
    }
    const createItems = publicCategoryIds.map((pubCatId) => ({
      publicCategory: { connect: { id: Number(pubCatId) } },
    }));

    if (isUpdate) {
      return {
        deleteMany: {},
        create: createItems,
      };
    }

    return {
      create: createItems,
    };
  }

  private async generateUniqueSlug(name: string, excludeProductId?: number): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let attempt = 1;

    let existing = await this.prisma.product.findFirst({
      where: {
        slug,
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      },
    });

    while (existing && attempt <= 3) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
      existing = await this.prisma.product.findFirst({
        where: {
          slug,
          ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
        },
      });
    }

    if (existing) {
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return slug;
  }

  private async buildFindAllWhereInput(query: {
    categoryId?: number;
    publicCategoryId?: number;
    search?: string;
  }): Promise<Prisma.ProductWhereInput> {
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
            some: { publicCategoryId: pubCatId },
          },
        },
      ];
    }

    if (query.search) {
      const searchInput = {
        contains: query.search,
        mode: 'insensitive' as const,
      };
      const searchOR = [
        { name: searchInput },
        { sku: searchInput },
        { slug: searchInput },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    return where;
  }

  private mapProductResponse(product: ProductWithRelations) {
    return {
      ...product,
      stock: product.stock?.quantity ?? 0,
      faultyQty: product.stock?.faultyQty ?? 0,
      publicCategoryIds: product.publicCategories.map((pc) => pc.publicCategoryId),
    };
  }
}
