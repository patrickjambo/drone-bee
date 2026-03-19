const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const customer = await prisma.customer.create({
      data: {
        name: "Test User",
        phone: "123",
        email: "test@test.com",
        type: "VIP",
        points: 0,
        total_spent: 0,
      }
    });
    console.log("Success", customer);
  } catch (error) {
    console.error("Error", error);
  }
}
run();
