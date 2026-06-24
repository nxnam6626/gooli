const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  await prisma.publicCategory.deleteMany({});
  console.log("Cleared all public categories. Backend should reseed on next restart.");
}
run().catch(console.error).finally(() => prisma.$disconnect());
