import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
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

  async getTree() {
    const roots = await this.prisma.category.findMany({
      where: { parentId: null, isVisibleOnWebsite: true },
      orderBy: { order: 'asc' },
      include: {
        subCategories: {
          where: { isVisibleOnWebsite: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return roots.map((root) => ({
      id: root.id,
      label: root.name,
      href: root.href,
      icon: root.icon,
      image: root.image,
      imagePosition: root.imagePosition,
      description: root.description,
      internalCategoryId: root.id,
      subMenu: root.subCategories.map((sub) => ({
        id: sub.id,
        label: sub.name,
        href: sub.href,
        internalCategoryId: sub.id,
      })),
    }));
  }

  async saveTree(treeData: TreeCategoryData[]) {
    const parentIds = new Set<number>();
    for (const parentNode of treeData) {
      if (parentNode.id) parentIds.add(Number(parentNode.id));
    }
    for (const parentNode of treeData) {
      if (parentNode.subMenu && Array.isArray(parentNode.subMenu)) {
        for (const childNode of parentNode.subMenu) {
          if (childNode.id && parentIds.has(Number(childNode.id))) {
            throw new BadRequestException(
              `Xung đột cấu trúc cây: Danh mục con ID ${childNode.id} không thể đồng thời làm danh mục cha.`,
            );
          }
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const keptIds: number[] = [];
      const collectIds = (nodes: TreeCategoryData[]) => {
        for (const node of nodes) {
          if (node.id) {
            keptIds.push(Number(node.id));
          }
          if (node.subMenu && Array.isArray(node.subMenu)) {
            for (const sub of node.subMenu) {
              if (sub.id) {
                keptIds.push(Number(sub.id));
              }
            }
          }
        }
      };
      collectIds(treeData);

      if (keptIds.length > 0) {
        const toDelete = await tx.category.findMany({
          where: { id: { notIn: keptIds } },
          select: { id: true, name: true, _count: { select: { products: true } } },
        });
        const inUse = toDelete.filter((c) => c._count.products > 0);
        if (inUse.length > 0) {
          throw new BadRequestException(
            `Không thể xóa các danh mục đang chứa sản phẩm: ${inUse.map((c) => c.name).join(', ')}`,
          );
        }
        await tx.category.deleteMany({
          where: {
            id: { notIn: keptIds },
          },
        });
      } else {
        const productsCount = await tx.product.count();
        if (productsCount > 0) {
          throw new BadRequestException(
            'Không thể xóa toàn bộ danh mục vì đang có sản phẩm tồn tại.',
          );
        }
        await tx.category.deleteMany({});
      }

      for (let i = 0; i < treeData.length; i++) {
        const parentNode = treeData[i];
        let parentId = parentNode.id ? Number(parentNode.id) : null;
        let parent;

        const parentData = {
          name: parentNode.label,
          slug: generateSlug(parentNode.label),
          href: parentNode.href,
          icon: parentNode.icon || 'Stack',
          image: parentNode.image || null,
          imagePosition: parentNode.imagePosition || null,
          description: parentNode.description || null,
          order: i,
          parentId: null,
          isVisibleOnWebsite: true,
        };

        if (parentId) {
          parent = await tx.category.update({
            where: { id: parentId },
            data: parentData,
          });
        } else {
          parent = await tx.category.create({
            data: parentData,
          });
          parentId = parent.id;
        }

        if (parentNode.subMenu && Array.isArray(parentNode.subMenu)) {
          for (let j = 0; j < parentNode.subMenu.length; j++) {
            const childNode = parentNode.subMenu[j];
            const childId = childNode.id ? Number(childNode.id) : null;

            const childData = {
              name: childNode.label,
              slug: generateSlug(childNode.label),
              href: childNode.href,
              icon: childNode.icon || 'Stack',
              parentId: parentId,
              order: j,
              isVisibleOnWebsite: true,
            };

            if (childId) {
              await tx.category.update({
                where: { id: childId },
                data: childData,
              });
            } else {
              await tx.category.create({
                data: childData,
              });
            }
          }
        }
      }
      return { success: true };
    });
  }

  async incrementView(href: string) {
    const category = await this.prisma.category.findFirst({
      where: { href },
    });
    if (!category) return { success: false };

    await this.prisma.category.update({
      where: { id: category.id },
      data: { views: { increment: 1 } },
    });
    return { success: true };
  }

  async getPopularCategories() {
    return this.prisma.category.findMany({
      where: {
        parentId: null,
        isVisibleOnWebsite: true,
        image: { not: null },
      },
      orderBy: { views: 'desc' },
      take: 2,
    });
  }
}

export interface SubMenuData {
  id?: number;
  label: string;
  href: string;
  icon?: string | null;
}

export interface TreeCategoryData {
  id?: number;
  label: string;
  href: string;
  icon?: string | null;
  image?: string | null;
  imagePosition?: string | null;
  description?: string | null;
  subMenu?: SubMenuData[];
}

