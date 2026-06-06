import { PrismaClient, UserRole, PartnerType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with WMS Master Data...');

  // 1. Clean up existing data
  await prisma.stock.deleteMany({});
  await prisma.productLocationStock.deleteMany({});
  await prisma.receiptItem.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.exportItem.deleteMany({});
  await prisma.export.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.warehouseLocation.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.consultation.deleteMany({});

  // 2. Seed Users
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('gooli2026', saltRounds);
  const staffPasswordHash = await bcrypt.hash('gooli2026', saltRounds);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@gooli.vn',
      passwordHash: adminPasswordHash,
      name: 'Nguyễn Văn Admin',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@gooli.vn',
      passwordHash: staffPasswordHash,
      name: 'Trần Thị Thủ Kho',
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  console.log('✅ Created users:', { admin: admin.email, staff: staff.email });

  // 3. Seed Categories
  const catCeiling = await prisma.category.create({
    data: {
      name: 'Trần nhôm',
      slug: 'tran-nhom',
    },
  });

  const catAccessory = await prisma.category.create({
    data: {
      name: 'Linh phụ kiện xây dựng',
      slug: 'linh-phu-kien-xay-dung',
    },
  });

  console.log('✅ Created categories');

  // 4. Seed Warehouse Locations
  const locGenA1 = await prisma.warehouseLocation.create({
    data: {
      code: 'WH-GEN-A1-H1',
      name: 'Kho Tổng - Dãy A1 - Hàng 1',
      zone: 'GENERAL',
      row: 'A1',
      shelf: 'Kệ 1',
      position: 'Hàng 1',
      description: 'Khu vực lưu trữ trần nhôm định hình Dãy A1',
    },
  });

  const locGenB2 = await prisma.warehouseLocation.create({
    data: {
      code: 'WH-GEN-B2-H3',
      name: 'Kho Tổng - Dãy B2 - Hàng 3',
      zone: 'GENERAL',
      row: 'B2',
      shelf: 'Kệ 2',
      position: 'Hàng 3',
      description: 'Khu vực lưu trữ phụ kiện lắp đặt Dãy B2',
    },
  });

  const locErr01 = await prisma.warehouseLocation.create({
    data: {
      code: 'WH-ERR-Z1-01',
      name: 'Khu Hàng Lỗi - Góc Tây',
      zone: 'ERROR',
      description: 'Khu lưu trữ sản phẩm lỗi hỏng chờ xử lý',
    },
  });

  const locWait01 = await prisma.warehouseLocation.create({
    data: {
      code: 'WH-WAIT-C1-01',
      name: 'Khu Chờ Xuất - Cửa Số 1',
      zone: 'SHIPPING_WAITING',
      description: 'Khu phân loại hàng chuẩn bị bốc xếp lên xe',
    },
  });

  console.log('✅ Created warehouse locations');

  // 5. Seed Partners (Suppliers & Customers)
  const supplierAlu = await prisma.partner.create({
    data: {
      code: 'NCC-ALU-FRANCE',
      name: 'Công ty Cổ phần Nhôm Việt Pháp',
      type: PartnerType.SUPPLIER,
      phone: '0243123456',
      email: 'contact@nhomvietphap.vn',
      address: 'KCN Từ Liêm, Hà Nội',
      taxCode: '0102030405',
    },
  });

  const supplierAust = await prisma.partner.create({
    data: {
      code: 'NCC-AUSTDOOR',
      name: 'Tập đoàn Austdoor',
      type: PartnerType.SUPPLIER,
      phone: '0283999999',
      email: 'info@austdoor.com',
      address: 'KCN Nhơn Trạch, Đồng Nai',
      taxCode: '0304050607',
    },
  });

  const customerAnPhu = await prisma.partner.create({
    data: {
      code: 'KH-ANPHU-BUILD',
      name: 'Công ty TNHH Xây dựng An Phú',
      type: PartnerType.CUSTOMER,
      phone: '0987654321',
      email: 'datmuahang@anphubuild.vn',
      address: '150 Trần Não, Quận 2, TP. HCM',
      taxCode: '0312567890',
    },
  });

  const customerDatViet = await prisma.partner.create({
    data: {
      code: 'DL-DATVIET-VLBXD',
      name: 'Đại lý Vật liệu Xây dựng Đất Việt',
      type: PartnerType.CUSTOMER,
      phone: '0912345678',
      email: 'datviet@gmail.com',
      address: '32 Song Hành, Quận 12, TP. HCM',
      taxCode: '0315891234',
    },
  });

  console.log('✅ Created partners (suppliers & customers)');

  // 6. Seed Products and Stocks
  const p1 = await prisma.product.create({
    data: {
      sku: 'ALU-U-SHAPED',
      name: 'Trần nhôm U-Shaped Gooli 100x30mm0.8',
      slug: 'tran-nhom-u-shaped-gooli-100x30mm-0-8',
      pricePerM2: 350000,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      description: 'Trần nhôm U-Shaped cao cấp, quy cách bản rộng 100mm, cao 30mm, dày 0.8mm, chiều dài thanh 3m.',
      thickness: 0.8,
      width: 100,
      length: 3000,
      unit: 'cây',
      category: { connect: { id: catCeiling.id } },
      stock: { create: { quantity: 100 } },
    },
  });

  const p2 = await prisma.product.create({
    data: {
      sku: 'ALU-CLIPIN-600',
      name: 'Trần nhôm Clip-in Gooli 600x600x0.6',
      slug: 'tran-nhom-clip-in-gooli-600x600-0-6',
      pricePerM2: 280000,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      description: 'Trần nhôm Clip-in Gooli quy cách 600x600mm, độ dày 0.6mm, hệ khung xương chìm đồng bộ.',
      thickness: 0.6,
      width: 600,
      length: 600,
      unit: 'tấm',
      category: { connect: { id: catCeiling.id } },
      stock: { create: { quantity: 50 } },
    },
  });

  const p3 = await prisma.product.create({
    data: {
      sku: 'ACC-XUONG-CA',
      name: 'Xương cá lắp trần nhôm',
      slug: 'xuong-ca-lap-tran-nhom',
      pricePerM2: 45000,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      description: 'Linh kiện thanh xương cá đỡ lực dùng cho hệ trần Clip-in.',
      thickness: null,
      width: null,
      length: null,
      unit: 'bộ',
      category: { connect: { id: catAccessory.id } },
      stock: { create: { quantity: 200 } },
    },
  });

  // Seed Product Location Stocks (Vị trí chi tiết tồn kho)
  await prisma.productLocationStock.createMany({
    data: [
      { productId: p1.id, locationId: locGenA1.id, quantity: 80 },
      { productId: p1.id, locationId: locGenB2.id, quantity: 20 },
      { productId: p2.id, locationId: locGenA1.id, quantity: 50 },
      { productId: p3.id, locationId: locGenB2.id, quantity: 200 },
    ],
  });

  // 7. Seed Projects
  console.log('🌱 Seeding Projects...');
  await prisma.project.createMany({
    data: [
      {
        name: 'Thi công công trình trần Caro Cell 200x200 màu Bắc Giang',
        slug: 'thi-cong-cong-trinh-tran-caro-cell-200x200-mau-bac-giang',
        imageUrl: '/projects/project_caro_cell_bg.png',
        description: 'Dự án thi công hoàn thiện hệ trần Caro Cell kích thước ô 200x200mm, tạo không gian mở hiện đại, thông thoáng cho nhà xưởng công nghiệp tại Bắc Giang.',
        location: 'Bắc Giang',
      },
      {
        name: 'Dự án thi công hoàn thiện trần G100 màu vân gỗ tại Thái Nguyên',
        slug: 'du-an-thi-cong-hoan-thien-tran-g100-mau-van-go-tai-thai-nguyen',
        imageUrl: '/projects/project_g100_wood_tn.png',
        description: 'Cung cấp và lắp đặt trần nhôm G100 dạng thanh màu vân gỗ tự nhiên sang trọng, cách âm tốt cho khu biệt thự văn phòng hành chính tại Thái Nguyên.',
        location: 'Thái Nguyên',
      },
      {
        name: 'Dự án thi công trần nhôm Caro Cell kết hợp với lam chắn nắng hình thoi',
        slug: 'du-an-thi-cong-tran-nhom-caro-cell-ket-hop-lam-chan-nang-hinh-thoi',
        imageUrl: '/projects/project_caro_sunshade.png',
        description: 'Tổ hợp giải pháp trần nhôm trang trí Caro Cell và hệ lam chắn nắng nhôm hình thoi bảo vệ mặt dựng, tối ưu hóa ánh sáng và cản bức xạ nhiệt cho tòa nhà.',
        location: 'Hà Nội',
      },
      {
        name: 'Dự án trần nhôm Caro Cell tại sảnh văn phòng Tổng công ty Việt Nam Airlines',
        slug: 'du-an-tran-nhom-caro-cell-sanh-van-phong-vietnam-airlines',
        imageUrl: '/projects/project_vna_sanh.png',
        description: 'Thi công trần nhôm Caro Cell cao cấp cho sảnh chính văn phòng đại diện Vietnam Airlines, khẳng định vị thế thương hiệu với thiết kế lưới ô nhôm sang trọng.',
        location: 'Hà Nội',
      },
      {
        name: 'Dự án thi công lam chắn nắng hình lá liễu tại trường THPT Chuyên Hà Nội - Amsterdam',
        slug: 'du-an-lam-chan-nang-la-lieu-amsterdam',
        imageUrl: '/projects/project_sunshade_ams.png',
        description: 'Thiết kế hệ lam chắn nắng lá liễu bao bọc mặt ngoài trường học, vừa giảm chói sáng cho lớp học vừa tạo điểm nhấn kiến trúc độc đáo, thẩm mỹ.',
        location: 'Hà Nội',
      },
    ],
  });
  console.log('✅ Created projects');

  console.log('✅ Created products, stocks and product location stocks');
  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
