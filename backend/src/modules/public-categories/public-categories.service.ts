import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_SEED_CATEGORIES = [
  {
    label: 'Lam gỗ nhựa trong nhà',
    href: '/san-pham/lam-trong-nha',
    icon: 'House',
    subMenu: [
      { label: 'Lam sóng PS', href: '/san-pham/lam-trong-nha/song-ps' },
      {
        label: 'Lam sóng bán nguyệt',
        href: '/san-pham/lam-trong-nha/song-ban-nguyet',
      },
      { label: 'Lam sóng tròn', href: '/san-pham/lam-trong-nha/song-tron' },
      { label: 'Lam hộp trong nhà', href: '/san-pham/lam-trong-nha/hop' },
      { label: 'Lam 3 sóng thấp', href: '/san-pham/lam-trong-nha/3-song-thap' },
      { label: 'Lam 4 sóng thấp', href: '/san-pham/lam-trong-nha/4-song-thap' },
      { label: 'Lam 5 sóng thấp', href: '/san-pham/lam-trong-nha/5-song-thap' },
    ],
  },
  {
    label: 'Lam gỗ nhựa ngoài trời',
    href: '/san-pham/lam-ngoai-troi',
    icon: 'Tree',
    subMenu: [
      { label: 'Tấm ốp ngoài trời', href: '/san-pham/lam-ngoai-troi/tam-op' },
      { label: 'Lam sóng ngoài trời', href: '/san-pham/lam-ngoai-troi/song' },
      { label: 'Lam hộp ngoài trời', href: '/san-pham/lam-ngoai-troi/hop' },
      {
        label: 'Thanh đa năng',
        href: '/san-pham/lam-ngoai-troi/thanh-da-nang',
      },
      {
        label: 'Sàn nhựa ngoài trời',
        href: '/san-pham/lam-ngoai-troi/san-nhua',
      },
    ],
  },
  {
    label: 'Tấm nano nhựa',
    href: '/san-pham/tam-nano',
    icon: 'Cube',
    subMenu: [
      { label: 'Tấm ốp Nano phẳng', href: '/san-pham/tam-nano/phang' },
      { label: 'Tấm ốp Nano vân gỗ', href: '/san-pham/tam-nano/van-go' },
      { label: 'Tấm ốp Nano vân đá', href: '/san-pham/tam-nano/van-da' },
    ],
  },
  {
    label: 'Vách ngăn 2 mặt',
    href: '/san-pham/vach-ngan',
    icon: 'Columns',
    subMenu: [
      { label: 'Vách ngăn kích thước 3.5m', href: '/san-pham/vach-ngan/3.5m' },
      { label: 'Vách ngăn kích thước 3.0m', href: '/san-pham/vach-ngan/3.0m' },
      { label: 'Vách ngăn kích thước 2.9m', href: '/san-pham/vach-ngan/2.9m' },
    ],
  },
  {
    label: 'La phông nhựa',
    href: '/san-pham/la-phong',
    icon: 'Stack',
    subMenu: [],
  },
  { label: 'Sàn gỗ nhựa', href: '/san-pham/san-go', icon: 'Rows', subMenu: [] },
  {
    label: 'Phào chỉ trang trí',
    href: '/san-pham/phao-chi',
    icon: 'Ruler',
    subMenu: [],
  },
  {
    label: 'Khung trần',
    href: '/san-pham/khung-tran',
    icon: 'GridFour',
    subMenu: [],
  },
  {
    label: 'Lam sóng ốp tường',
    href: '/san-pham/lam-song-op-tuong',
    icon: 'Stack',
    subMenu: [],
  },
  {
    label: 'Tấm PVC vân đá',
    href: '/san-pham/pvc-van-da',
    icon: 'Cube',
    subMenu: [],
  },
  {
    label: 'Phụ kiện thi công',
    href: '/san-pham/phu-kien',
    icon: 'Wrench',
    subMenu: [],
  },
];

export interface SubMenuData {
  label: string;
  href: string;
  icon?: string | null;
}

export interface TreeCategoryData {
  label: string;
  href: string;
  icon?: string | null;
  image?: string | null;
  imagePosition?: string | null;
  description?: string | null;
  subMenu?: SubMenuData[];
}

@Injectable()
export class PublicCategoriesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedIfEmpty();
  }

  async seedIfEmpty() {
    const count = await this.prisma.publicCategory.count();
    if (count === 0) {
      console.log(
        'PublicCategory table is empty. Seeding default categories...',
      );
      await this.saveTree(DEFAULT_SEED_CATEGORIES);
      console.log('Public categories seeding completed successfully.');
    }
  }

  async getTree() {
    // Fetch only root categories (parentId = null) and include subcategories ordered by order ascending
    const roots = await this.prisma.publicCategory.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        subCategories: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Map database relations to match the frontend categories array format:
    // { label: string, href: string, icon: string, image?: string, description?: string, subMenu: { label: string, href: string }[] }
    return roots.map((root) => ({
      id: root.id,
      label: root.label,
      href: root.href,
      icon: root.icon,
      image: root.image,
      imagePosition: root.imagePosition,
      description: root.description,
      subMenu: root.subCategories.map((sub) => ({
        id: sub.id,
        label: sub.label,
        href: sub.href,
      })),
    }));
  }

  async saveTree(treeData: TreeCategoryData[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all existing public categories
      await tx.publicCategory.deleteMany({});

      // 2. Insert new tree nodes
      for (let i = 0; i < treeData.length; i++) {
        const parentNode = treeData[i];
        const parent = await tx.publicCategory.create({
          data: {
            label: parentNode.label,
            href: parentNode.href,
            icon: parentNode.icon || 'Stack',
            image: parentNode.image,
            imagePosition: parentNode.imagePosition,
            description: parentNode.description,
            order: i,
          },
        });

        if (parentNode.subMenu && Array.isArray(parentNode.subMenu)) {
          for (let j = 0; j < parentNode.subMenu.length; j++) {
            const childNode = parentNode.subMenu[j];
            await tx.publicCategory.create({
              data: {
                label: childNode.label,
                href: childNode.href,
                icon: childNode.icon || 'Stack',
                parentId: parent.id,
                order: j,
              },
            });
          }
        }
      }
      return { success: true };
    });
  }
}
