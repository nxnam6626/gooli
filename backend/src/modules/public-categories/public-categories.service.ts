import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TreeCategoryData } from './public-categories.types';

@Injectable()
export class PublicCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree() {
    const roots = await this.prisma.publicCategory.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        subCategories: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return roots.map((root) => ({
      id: root.id,
      label: root.label,
      href: root.href,
      icon: root.icon,
      image: root.image,
      imagePosition: root.imagePosition,
      description: root.description,
      internalCategoryId: root.internalCategoryId,
      subMenu: root.subCategories.map((sub) => ({
        id: sub.id,
        label: sub.label,
        href: sub.href,
        internalCategoryId: sub.internalCategoryId,
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
        await tx.publicCategory.deleteMany({
          where: {
            id: { notIn: keptIds },
          },
        });
      } else {
        await tx.publicCategory.deleteMany({});
      }

      for (let i = 0; i < treeData.length; i++) {
        const parentNode = treeData[i];
        let parentId = parentNode.id ? Number(parentNode.id) : null;
        let parent;

        const parentData = {
          label: parentNode.label,
          href: parentNode.href,
          icon: parentNode.icon || 'Stack',
          image: parentNode.image || null,
          imagePosition: parentNode.imagePosition || null,
          description: parentNode.description || null,
          order: i,
          parentId: null,
          internalCategoryId: parentNode.internalCategoryId
            ? Number(parentNode.internalCategoryId)
            : null,
        };

        if (parentId) {
          parent = await tx.publicCategory.update({
            where: { id: parentId },
            data: parentData,
          });
        } else {
          parent = await tx.publicCategory.create({
            data: parentData,
          });
          parentId = parent.id;
        }

        if (parentNode.subMenu && Array.isArray(parentNode.subMenu)) {
          for (let j = 0; j < parentNode.subMenu.length; j++) {
            const childNode = parentNode.subMenu[j];
            const childId = childNode.id ? Number(childNode.id) : null;

            const childData = {
              label: childNode.label,
              href: childNode.href,
              icon: childNode.icon || 'Stack',
              parentId: parentId,
              order: j,
              internalCategoryId: childNode.internalCategoryId
                ? Number(childNode.internalCategoryId)
                : null,
            };

            if (childId) {
              await tx.publicCategory.update({
                where: { id: childId },
                data: childData,
              });
            } else {
              await tx.publicCategory.create({
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
    const category = await this.prisma.publicCategory.findFirst({
      where: { href },
    });
    if (!category) return { success: false };

    await this.prisma.publicCategory.update({
      where: { id: category.id },
      data: { views: { increment: 1 } },
    });
    return { success: true };
  }

  async getPopularCategories() {
    return this.prisma.publicCategory.findMany({
      where: {
        parentId: null,
        image: { not: null },
      },
      orderBy: { views: 'desc' },
      take: 2,
    });
  }
}
