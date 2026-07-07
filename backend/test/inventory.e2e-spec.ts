import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { TransactionStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('Inventory Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminToken: string;
  let staffToken: string;

  let testCategory: any;
  let testProduct: any;
  let testPartner: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Clean up test data if any
    await prisma.receiptItem.deleteMany({});
    await prisma.receipt.deleteMany({});
    await prisma.exportItem.deleteMany({});
    await prisma.export.deleteMany({});
    await prisma.stock.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.partner.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: ['test-admin@gooli.vn', 'test-staff@gooli.vn'] } },
    });

    // 1. Create Users
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'test-admin@gooli.vn',
        passwordHash,
        name: 'Test Admin',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    const staffUser = await prisma.user.create({
      data: {
        email: 'test-staff@gooli.vn',
        passwordHash,
        name: 'Test Staff',
        role: UserRole.STAFF,
        isActive: true,
      },
    });

    // 2. Generate Tokens
    adminToken = jwtService.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role });
    staffToken = jwtService.sign({ sub: staffUser.id, email: staffUser.email, role: staffUser.role });

    // 3. Create Master Data
    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
      },
    });

    testProduct = await prisma.product.create({
      data: {
        categoryId: testCategory.id,
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        slug: 'test-product',
        pricePerM2: 100000,
        imageUrl: 'https://cloudinary.com/test.jpg',
        unit: 'tấm',
        isActive: true,
      },
    });

    testPartner = await prisma.partner.create({
      data: {
        code: 'TEST-NCC-001',
        name: 'Test Supplier',
        type: 'SUPPLIER',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.receiptItem.deleteMany({});
    await prisma.receipt.deleteMany({});
    await prisma.exportItem.deleteMany({});
    await prisma.export.deleteMany({});
    await prisma.stock.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.partner.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: ['test-admin@gooli.vn', 'test-staff@gooli.vn'] } },
    });
    await app.close();
  });

  describe('Receipts (Nhập kho)', () => {
    let pendingReceiptId: number;
    let approvedReceiptId: number;

    it('should create a PENDING receipt when expectedDeliveryDate is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/receipts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          partnerId: testPartner.id,
          note: 'Test Pending Receipt',
          expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
          items: [
            {
              productId: testProduct.id,
              quantity: 10,
              price: 50000,
              vatRate: 10,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(TransactionStatus.PENDING);
      pendingReceiptId = response.body.id;

      // Stock should remain unchanged (0)
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity ?? 0).toBe(0);
    });

    it('should create an APPROVED receipt and update stock immediately when expectedDeliveryDate is omitted', async () => {
      const response = await request(app.getHttpServer())
        .post('/receipts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          partnerId: testPartner.id,
          note: 'Test Direct Approved Receipt',
          items: [
            {
              productId: testProduct.id,
              quantity: 15,
              price: 50000,
              vatRate: 10,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(TransactionStatus.APPROVED);
      approvedReceiptId = response.body.id;

      // Stock should be updated directly to 15
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity).toBe(15);
    });

    it('should approve a PENDING receipt and increment stock', async () => {
      const response = await request(app.getHttpServer())
        .post(`/receipts/${pendingReceiptId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(TransactionStatus.APPROVED);

      // Stock should now be 15 + 10 = 25
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity).toBe(25);
    });

    it('should throw ConflictException when trying to approve an already approved receipt', async () => {
      const response = await request(app.getHttpServer())
        .post(`/receipts/${pendingReceiptId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('đã được xử lý');
    });

    it('should reject a PENDING receipt without changing stock', async () => {
      // Create another pending receipt first
      const createRes = await request(app.getHttpServer())
        .post('/receipts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          partnerId: testPartner.id,
          note: 'To Be Rejected',
          expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
          items: [
            {
              productId: testProduct.id,
              quantity: 5,
              price: 50000,
              vatRate: 10,
            },
          ],
        });

      const rejectId = createRes.body.id;

      const response = await request(app.getHttpServer())
        .post(`/receipts/${rejectId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(TransactionStatus.REJECTED);

      // Stock should remain 25
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity).toBe(25);
    });
  });

  describe('Exports (Xuất kho)', () => {
    let exportId: number;

    it('should create a PENDING export and NOT change stock', async () => {
      const response = await request(app.getHttpServer())
        .post('/exports')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          note: 'Test Export',
          items: [
            {
              productId: testProduct.id,
              quantity: 10,
              isFaulty: false,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(TransactionStatus.PENDING);
      exportId = response.body.id;

      // Stock should remain 25
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity).toBe(25);
    });

    it('should approve a PENDING export and decrement stock if quantity is sufficient', async () => {
      const response = await request(app.getHttpServer())
        .post(`/exports/${exportId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(TransactionStatus.APPROVED);

      // Stock should be 25 - 10 = 15
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity).toBe(15);
    });

    it('should throw BadRequestException when trying to approve an export with insufficient stock', async () => {
      // Create another export requesting more than current stock (15)
      const createRes = await request(app.getHttpServer())
        .post('/exports')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          note: 'Insufficient Stock Export',
          items: [
            {
              productId: testProduct.id,
              quantity: 20,
              isFaulty: false,
            },
          ],
        });

      const badExportId = createRes.body.id;

      const response = await request(app.getHttpServer())
        .post(`/exports/${badExportId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('không đủ tồn kho');

      // Stock should remain 15
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity).toBe(15);
    });
  });

  describe('Concurrency & Race Conditions (Kiểm soát đồng thời)', () => {
    it('should handle simultaneous approve requests for the same receipt (one succeeds, one returns 409 Conflict)', async () => {
      // 1. Create a pending receipt
      const createRes = await request(app.getHttpServer())
        .post('/receipts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          partnerId: testPartner.id,
          note: 'Concurrent Approve Receipt',
          expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
          items: [{ productId: testProduct.id, quantity: 5, price: 50000, vatRate: 10 }],
        });

      const receiptId = createRes.body.id;
      const initialStock = (await prisma.stock.findUnique({ where: { productId: testProduct.id } }))?.quantity ?? 0;

      // 2. Fire two approve requests concurrently
      const promises = [
        request(app.getHttpServer()).post(`/receipts/${receiptId}/approve`).set('Authorization', `Bearer ${adminToken}`).send(),
        request(app.getHttpServer()).post(`/receipts/${receiptId}/approve`).set('Authorization', `Bearer ${adminToken}`).send(),
      ];

      const results = await Promise.all(promises);
      const statuses = results.map(r => r.status);

      // 3. Verify exactly one succeeded (201) and one failed with conflict (409)
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);

      // 4. Verify stock was updated exactly once (+5)
      const stock = await prisma.stock.findUnique({ where: { productId: testProduct.id } });
      expect(stock?.quantity).toBe(initialStock + 5);
    });

    it('should successfully generate unique receipt codes for 10 concurrent creation requests', async () => {
      // 1. Fire 10 receipt creations concurrently
      const promises = Array.from({ length: 10 }).map(() =>
        request(app.getHttpServer())
          .post('/receipts')
          .set('Authorization', `Bearer ${staffToken}`)
          .send({
            partnerId: testPartner.id,
            note: 'Concurrent Creation Test',
            expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString(), // Use pending so we don't worry about stock increments here
            items: [{ productId: testProduct.id, quantity: 1, price: 50000, vatRate: 10 }],
          })
      );

      const results = await Promise.all(promises);

      // 2. Verify all creations succeeded
      results.forEach(res => {
        expect(res.status).toBe(201);
      });

      // 3. Verify all generated receipt codes are unique
      const codes = results.map(res => res.body.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(10);
    });
  });
});
