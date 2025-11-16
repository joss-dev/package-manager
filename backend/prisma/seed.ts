import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { OrderStatus } from '../src/common/enums/order-status.enum';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);
  const users = await prisma.user.createMany({
    data: [
      { email: 'admin@example.com', passwordHash },
      { email: 'seller@example.com', passwordHash },
      { email: 'buyer@example.com', passwordHash },
    ],
  });
  console.log(`✅ Created ${users.count} users`);

  const productsData = Array.from({ length: 150 }).map(() => ({
    name: faker.commerce.productName(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    price: parseFloat(faker.commerce.price({ min: 100, max: 2000, dec: 2 })),
    stock: faker.number.int({ min: 5, max: 100 }),
  }));

  const products = await prisma.product.createMany({ data: productsData });
  console.log(`✅ Created ${products.count} products`);

  const customersData = Array.from({ length: 5 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
  }));

  const customers = await prisma.customer.createMany({ data: customersData });
  console.log(`✅ Created ${customers.count} customers`);

  const allCustomers = await prisma.customer.findMany();
  const allProducts = await prisma.product.findMany();

  for (const customer of allCustomers) {
    const numOrders = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numOrders; i++) {
      const selectedProducts = faker.helpers.arrayElements(
        allProducts,
        faker.number.int({ min: 1, max: 5 }),
      );

      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          status: faker.helpers.arrayElement([
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
          ]),
          total: 0,
        },
      });

      let total = 0;

      for (const product of selectedProducts) {
        const qty = faker.number.int({ min: 1, max: 5 });
        const price = Number(product.price);
        total += qty * price;

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            qty,
            price,
          },
        });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { total },
      });
    }
  }

  console.log('✅ Orders and order items created');
  console.log('🌿 Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed', e);
    await prisma.$disconnect();
    process.exit(1);
  });
