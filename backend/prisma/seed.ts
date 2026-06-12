import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Resetting database to clean slate...');

  // Xóa toàn bộ dữ liệu theo thứ tự đúng (foreign key constraints)
  await prisma.paymentSlip.deleteMany({});
  await prisma.customerReturnItem.deleteMany({});
  await prisma.customerReturn.deleteMany({});
  await prisma.supplierReturnItem.deleteMany({});
  await prisma.supplierReturn.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.receiptItem.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.exportItem.deleteMany({});
  await prisma.export.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.manufacturer.deleteMany({});
  await prisma.itemClass.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🗑️  Cleared all data.');

  // Chỉ tạo tài khoản admin và staff để đăng nhập hệ thống
  const saltRounds = 10;
  const adminHash = await bcrypt.hash('gooli2026', saltRounds);
  const staffHash = await bcrypt.hash('gooli2026', saltRounds);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@gooli.vn',
      passwordHash: adminHash,
      name: 'Nguyễn Văn Admin',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@gooli.vn',
      passwordHash: staffHash,
      name: 'Trần Thị Thủ Kho',
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  console.log('✅ Created system accounts:');
  console.log(`   Admin : ${admin.email}  / gooli2026`);
  console.log(`   Staff : ${staff.email}  / gooli2026`);
  console.log('');
  console.log('✅ Database reset complete — clean slate ready for testing.');
  console.log('   • Products  : 0');
  console.log('   • Partners  : 0');
  console.log('   • Categories: 0');
  console.log('   • Projects  : 0');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
