import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';

describe('OrderService (integration)', () => {
  let service: OrderService;
  let prisma: PrismaService;
  let customer: any;
  let productA: any;
  let productB: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService, PrismaService],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.product.deleteMany(),
      prisma.customer.deleteMany(),
    ]);

    customer = await prisma.customer.create({
      data: { name: 'Cliente 1', email: 'cliente1@mail.com' },
    });

    productA = await prisma.product.create({
      data: { name: 'Prod A', sku: 'A001', price: 100, stock: 10 },
    });

    productB = await prisma.product.create({
      data: { name: 'Prod B', sku: 'B002', price: 50, stock: 5 },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debería crear un pedido y calcular el total correctamente', async () => {
    const dto = {
      customerId: customer.id,
      items: [
        { productId: productA.id, qty: 1 },
        { productId: productB.id, qty: 2 },
      ],
    };

    const order = await service.create(dto as any);
    const expectedTotal = 100 * 1 + 50 * 2;

    expect(order.total).toBe(expectedTotal);
    expect(order.status).toBe(OrderStatus.PENDING);
  });

  it('debería confirmar el pedido y descontar stock', async () => {
    const dto = {
      customerId: customer.id,
      items: [
        { productId: productA.id, qty: 1 },
        { productId: productB.id, qty: 2 },
      ],
    };

    const createdOrder = await service.create(dto as any);
    const confirmedOrder = await service.confirm(createdOrder.id);

    const prodA = await prisma.product.findUnique({
      where: { id: productA.id },
    });
    const prodB = await prisma.product.findUnique({
      where: { id: productB.id },
    });

    expect(confirmedOrder.status).toBe(OrderStatus.CONFIRMED);
    expect(prodA?.stock).toBe(9);
    expect(prodB?.stock).toBe(3);
  });

  it('debería lanzar error si el stock es insuficiente', async () => {
    const dto = {
      customerId: customer.id,
      items: [{ productId: productB.id, qty: 10 }],
    };

    const order = await service.create(dto as any);

    await expect(service.confirm(order.id)).rejects.toThrow(
      /Stock insuficiente/i,
    );
  });
});
