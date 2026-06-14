import {
  PrismaClient,
  UserRole,
  PartnerType,
  TransactionStatus,
  PaymentStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 10;

async function clearDatabase() {
  console.log('🗑️ Clearing database...');
  await prisma.paymentSlip.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.receiptItem.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.exportItem.deleteMany({});
  await prisma.export.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.itemClass.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.partnerGroup.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('🗑️ Database cleared.');
}

async function createUsers() {
  const hashedPassword = await bcrypt.hash('gooli2026', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@gooli.vn',
      passwordHash: hashedPassword,
      name: 'Nguyễn Văn Admin',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@gooli.vn',
      passwordHash: hashedPassword,
      name: 'Trần Thị Thủ Kho',
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  console.log('✅ Users created:', admin.email, staff.email);
  return { admin, staff };
}

async function createMetadata() {
  const aluminumCeilingCategory = await prisma.category.create({
    data: { name: 'Trần nhôm', slug: 'tran-nhom' },
  });
  const partitionWallCategory = await prisma.category.create({
    data: { name: 'Vách ngăn', slug: 'vach-ngan' },
  });
  const accessoryCategory = await prisma.category.create({
    data: { name: 'Phụ kiện', slug: 'phu-kien' },
  });

  const plateUnit = await prisma.unit.create({
    data: { code: 'TAM', name: 'Tấm' },
  });
  const squareMeterUnit = await prisma.unit.create({
    data: { code: 'M2', name: 'm²' },
  });
  const pieceUnit = await prisma.unit.create({
    data: { code: 'CAI', name: 'Cái' },
  });

  const supplierGroup = await prisma.partnerGroup.create({
    data: { code: 'NCC', name: 'Nhà cung cấp' },
  });
  const customerGroup = await prisma.partnerGroup.create({
    data: { code: 'KH', name: 'Khách hàng' },
  });

  console.log('✅ Metadata created.');

  return {
    categories: {
      aluminumCeilingCategory,
      partitionWallCategory,
      accessoryCategory,
    },
    units: { plateUnit, squareMeterUnit, pieceUnit },
    partnerGroups: { supplierGroup, customerGroup },
  };
}

async function createPartners(
  supplierGroupId: number,
  customerGroupId: number,
) {
  const vinaSupplier = await prisma.partner.create({
    data: {
      code: 'NCC-001',
      name: 'Công ty TNHH Nhôm Vina',
      type: PartnerType.SUPPLIER,
      partnerGroupId: supplierGroupId,
      phone: '024-3868-1234',
      email: 'contact@nhomvina.vn',
      address: '45 Lê Văn Lương, Hà Nội',
      taxCode: '0101234567',
      totalDebt: 0,
    },
  });

  const alphaSupplier = await prisma.partner.create({
    data: {
      code: 'NCC-002',
      name: 'Công ty CP Vật liệu Alpha',
      type: PartnerType.SUPPLIER,
      partnerGroupId: supplierGroupId,
      phone: '028-3856-5678',
      email: 'sales@alpha-vl.com',
      address: '123 Nguyễn Huệ, TP.HCM',
      taxCode: '0309876543',
      totalDebt: 0,
    },
  });

  const hoangGiaCustomer = await prisma.partner.create({
    data: {
      code: 'KH-001',
      name: 'Công ty XD Hoàng Gia',
      type: PartnerType.CUSTOMER,
      partnerGroupId: customerGroupId,
      phone: '091-234-5678',
      email: 'info@hoanggia.vn',
      address: '56 Trần Hưng Đạo, Hà Nội',
      totalDebt: 0,
    },
  });

  const minhLongCustomer = await prisma.partner.create({
    data: {
      code: 'KH-002',
      name: 'Công ty Nội thất Minh Long',
      type: PartnerType.CUSTOMER,
      partnerGroupId: customerGroupId,
      phone: '090-876-5432',
      address: '78 Bạch Đằng, Đà Nẵng',
      totalDebt: 0,
    },
  });

  console.log('✅ Partners created.');
  return { vinaSupplier, alphaSupplier, hoangGiaCustomer, minhLongCustomer };
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function createProducts(
  categories: {
    aluminumCeilingCategory: { id: number };
    partitionWallCategory: { id: number };
    accessoryCategory: { id: number };
  },
) {
  const whiteAluminumCeilingProduct = await prisma.product.create({
    data: {
      categoryId: categories.aluminumCeilingCategory.id,
      sku: 'TN-600-WH',
      name: 'Tấm trần nhôm 600×600 Trắng',
      slug: generateSlug('Tấm trần nhôm 600×600 Trắng'),
      pricePerM2: 180000,
      imageUrl: 'https://placehold.co/400x300?text=TN-600-WH',
      unit: 'tấm',
      isActive: true,
      minQuantity: 10,
      stock: { create: { quantity: 0, faultyQty: 0 } },
    },
  });

  const silverAluminumCeilingProduct = await prisma.product.create({
    data: {
      categoryId: categories.aluminumCeilingCategory.id,
      sku: 'TN-600-SV',
      name: 'Tấm trần nhôm 600×600 Bạc',
      slug: generateSlug('Tấm trần nhôm 600×600 Bạc'),
      pricePerM2: 195000,
      imageUrl: 'https://placehold.co/400x300?text=TN-600-SV',
      unit: 'tấm',
      isActive: true,
      minQuantity: 10,
      stock: { create: { quantity: 0, faultyQty: 0 } },
    },
  });

  const glassPartitionProduct = await prisma.product.create({
    data: {
      categoryId: categories.partitionWallCategory.id,
      sku: 'VN-AL-100',
      name: 'Vách ngăn nhôm kính 100×240cm',
      slug: generateSlug('Vách ngăn nhôm kính 100×240cm'),
      pricePerM2: 650000,
      imageUrl: 'https://placehold.co/400x300?text=VN-AL-100',
      unit: 'm²',
      isActive: true,
      minQuantity: 5,
      stock: { create: { quantity: 0, faultyQty: 0 } },
    },
  });

  const doorHandleProduct = await prisma.product.create({
    data: {
      categoryId: categories.accessoryCategory.id,
      sku: 'PK-TAY-NAM',
      name: 'Tay nắm cửa nhôm đúc',
      slug: generateSlug('Tay nắm cửa nhôm đúc'),
      pricePerM2: 85000,
      imageUrl: 'https://placehold.co/400x300?text=PK-TAY-NAM',
      unit: 'cái',
      isActive: true,
      minQuantity: 20,
      stock: { create: { quantity: 0, faultyQty: 0 } },
    },
  });

  const rubberGasketProduct = await prisma.product.create({
    data: {
      categoryId: categories.accessoryCategory.id,
      sku: 'PK-GE-TRAN',
      name: 'Gioăng cao su trần nhôm',
      slug: generateSlug('Gioăng cao su trần nhôm'),
      pricePerM2: 15000,
      imageUrl: 'https://placehold.co/400x300?text=PK-GE-TRAN',
      unit: 'cái',
      isActive: true,
      minQuantity: 50,
      stock: { create: { quantity: 0, faultyQty: 0 } },
    },
  });

  console.log('✅ Products created.');
  return {
    whiteAluminumCeilingProduct,
    silverAluminumCeilingProduct,
    glassPartitionProduct,
    doorHandleProduct,
    rubberGasketProduct,
  };
}

async function createReceipts(
  staffId: number,
  adminId: number,
  partners: {
    vinaSupplier: { id: number };
    alphaSupplier: { id: number };
  },
  products: {
    whiteAluminumCeilingProduct: { id: number };
    silverAluminumCeilingProduct: { id: number };
    glassPartitionProduct: { id: number };
    doorHandleProduct: { id: number };
    rubberGasketProduct: { id: number };
  },
) {
  const receiptFirstBatch = await prisma.receipt.create({
    data: {
      code: 'NK-20260601-001',
      status: TransactionStatus.APPROVED,
      createdById: staffId,
      approvedById: adminId,
      partnerId: partners.vinaSupplier.id,
      invoiceNumber: 'HD-2026-0156',
      invoiceDate: new Date('2026-06-01'),
      note: 'Nhập hàng đợt 1 - Tháng 6',
      preTaxTotal: 4500000,
      postTaxTotal: 4950000,
      paidAmount: 4950000,
      paymentStatus: PaymentStatus.PAID,
      approvedAt: new Date('2026-06-01T10:30:00'),
      items: {
        create: [
          {
            productId: products.whiteAluminumCeilingProduct.id,
            quantity: 20,
            price: 180000,
            vatRate: 10,
            isFaulty: false,
          },
          {
            productId: products.silverAluminumCeilingProduct.id,
            quantity: 5,
            price: 195000,
            vatRate: 10,
            isFaulty: false,
          },
        ],
      },
    },
  });

  await prisma.stock.update({
    where: { productId: products.whiteAluminumCeilingProduct.id },
    data: { quantity: { increment: 20 } },
  });
  await prisma.stock.update({
    where: { productId: products.silverAluminumCeilingProduct.id },
    data: { quantity: { increment: 5 } },
  });

  const receiptSecondBatch = await prisma.receipt.create({
    data: {
      code: 'NK-20260605-002',
      status: TransactionStatus.APPROVED,
      createdById: staffId,
      approvedById: adminId,
      partnerId: partners.alphaSupplier.id,
      invoiceNumber: 'INV-ALPHA-0089',
      invoiceDate: new Date('2026-06-05'),
      note: 'Nhập vách ngăn và phụ kiện',
      preTaxTotal: 8650000,
      postTaxTotal: 9515000,
      paidAmount: 5000000,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      approvedAt: new Date('2026-06-05T14:00:00'),
      items: {
        create: [
          {
            productId: products.glassPartitionProduct.id,
            quantity: 10,
            price: 650000,
            vatRate: 10,
            isFaulty: false,
          },
          {
            productId: products.doorHandleProduct.id,
            quantity: 30,
            price: 85000,
            vatRate: 10,
            isFaulty: false,
          },
          {
            productId: products.rubberGasketProduct.id,
            quantity: 100,
            price: 15000,
            vatRate: 10,
            isFaulty: false,
          },
        ],
      },
    },
  });

  await prisma.stock.update({
    where: { productId: products.glassPartitionProduct.id },
    data: { quantity: { increment: 10 } },
  });
  await prisma.stock.update({
    where: { productId: products.doorHandleProduct.id },
    data: { quantity: { increment: 30 } },
  });
  await prisma.stock.update({
    where: { productId: products.rubberGasketProduct.id },
    data: { quantity: { increment: 100 } },
  });

  const receiptPendingBatch = await prisma.receipt.create({
    data: {
      code: 'NK-20260612-003',
      status: TransactionStatus.PENDING,
      createdById: staffId,
      partnerId: partners.vinaSupplier.id,
      invoiceNumber: 'HD-2026-0201',
      invoiceDate: new Date('2026-06-12'),
      note: 'Nhập bổ sung trần nhôm trắng',
      expectedDeliveryDate: new Date('2026-06-16T09:00:00Z'),
      preTaxTotal: 2700000,
      postTaxTotal: 2970000,
      paidAmount: 0,
      paymentStatus: PaymentStatus.UNPAID,
      items: {
        create: [
          {
            productId: products.whiteAluminumCeilingProduct.id,
            quantity: 15,
            price: 180000,
            vatRate: 10,
            isFaulty: false,
          },
        ],
      },
    },
  });

  console.log('✅ Receipts created.');
  return { receiptFirstBatch, receiptSecondBatch, receiptPendingBatch };
}

async function createExports(
  staffId: number,
  adminId: number,
  partnerId: number,
  products: {
    whiteAluminumCeilingProduct: { id: number; sku: string };
    doorHandleProduct: { id: number; sku: string };
  },
) {
  const exportHoangGia = await prisma.export.create({
    data: {
      code: 'XK-20260608-001',
      status: TransactionStatus.APPROVED,
      createdById: staffId,
      approvedById: adminId,
      partnerId: partnerId,
      note: 'Giao hàng công trình Hoàng Gia Tower',
      preTaxTotal: 5200000,
      postTaxTotal: 5720000,
      paidAmount: 5720000,
      paymentStatus: PaymentStatus.PAID,
      approvedAt: new Date('2026-06-08T16:00:00'),
      items: {
        create: [
          {
            productId: products.whiteAluminumCeilingProduct.id,
            quantity: 20,
            price: 220000,
            vatRate: 10,
            isFaulty: false,
          },
          {
            productId: products.doorHandleProduct.id,
            quantity: 10,
            price: 120000,
            vatRate: 10,
            isFaulty: false,
          },
        ],
      },
    },
  });

  await prisma.stock.update({
    where: { productId: products.whiteAluminumCeilingProduct.id },
    data: { quantity: { decrement: 20 } },
  });
  await prisma.stock.update({
    where: { productId: products.doorHandleProduct.id },
    data: { quantity: { decrement: 10 } },
  });

  console.log('✅ Exports created.');
  return exportHoangGia;
}

async function main() {
  console.log('🌱 Seeding database with sample data...');

  await clearDatabase();
  const { admin, staff } = await createUsers();

  const metadata = await createMetadata();
  const partners = await createPartners(
    metadata.partnerGroups.supplierGroup.id,
    metadata.partnerGroups.customerGroup.id,
  );
  const products = await createProducts(
    metadata.categories,
  );

  await createReceipts(staff.id, admin.id, partners, products);
  await createExports(
    staff.id,
    admin.id,
    partners.hoangGiaCustomer.id,
    products,
  );

  console.log('');
  console.log('✅ Seed hoàn tất!');
  console.log('   👤 admin@gooli.vn / gooli2026 (ADMIN)');
  console.log('   👤 staff@gooli.vn  / gooli2026 (STAFF)');
  console.log('   📦 Products  : 5');
  console.log('   🤝 Partners  : 4 (2 NCC + 2 KH)');
  console.log('   📋 Receipts  : 3 (2 Đã duyệt + 1 Chờ duyệt)');
  console.log('   📤 Exports   : 1');
  console.log('');
  console.log('   Tồn kho hiện tại:');
  console.log(
    `   - ${products.whiteAluminumCeilingProduct.sku}: ${20 - 20} tấm`,
  );
  console.log(`   - ${products.silverAluminumCeilingProduct.sku}: 5 tấm`);
  console.log(`   - ${products.glassPartitionProduct.sku}: 10 m²`);
  console.log(`   - ${products.doorHandleProduct.sku}: ${30 - 10} cái`);
  console.log(`   - ${products.rubberGasketProduct.sku}: 100 cái`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
