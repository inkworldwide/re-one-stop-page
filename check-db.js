const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    console.log("Users count:", userCount);
    console.log("Properties count:", propertyCount);
  } catch (e) {
    console.error("Prisma error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
