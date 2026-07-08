import { Prisma } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateSlug } from '../categories/categories.service';

export const PRODUCT_INCLUDE = {
  category: true,
  stock: true,
} as const;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

export async function ensureCategoryExists(
  prisma: Prisma.TransactionClient | PrismaService,
  categoryId: number,
): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new NotFoundException(`Không tìm thấy danh mục với ID ${categoryId}.`);
  }
}

export async function ensureSkuUnique(
  prisma: Prisma.TransactionClient | PrismaService,
  sku: string,
  excludeProductId?: number,
): Promise<void> {
  const existingSku = await prisma.product.findFirst({
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


export async function generateUniqueSlug(
  prisma: Prisma.TransactionClient | PrismaService,
  name: string,
  excludeProductId?: number,
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let attempt = 1;

  let existing = await prisma.product.findFirst({
    where: {
      slug,
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
    },
  });

  while (existing && attempt <= 3) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
    existing = await prisma.product.findFirst({
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

export async function buildFindAllWhereInput(
  prisma: Prisma.TransactionClient | PrismaService,
  query: { categoryId?: number; publicCategoryId?: number; search?: string },
): Promise<Prisma.ProductWhereInput> {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (query.categoryId) {
    where.categoryId = Number(query.categoryId);
  }

  if (query.publicCategoryId) {
    const pubCatId = Number(query.publicCategoryId);
    const pubCat = await prisma.publicCategory.findUnique({
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

export function mapProductResponse(product: ProductWithRelations) {
  return {
    ...product,
    stock: product.stock?.quantity ?? 0,
    faultyQty: product.stock?.faultyQty ?? 0,
  };
}
