import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { OrderStatus } from 'src/common/enums/order-status.enum';

describe('OrderService (unit)', () => {
  let service: OrderService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService, PrismaService],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('calcular correctamente el total de un pedido', async () => {
    prisma.$transaction = jest.fn().mockImplementation(async (cb) => {
      const tx = {
        customer: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
        product: {
          findMany: jest.fn().mockResolvedValue([
            { id: 1, price: 100 },
            { id: 2, price: 50 },
          ]),
        },
        order: {
          create: jest.fn().mockResolvedValue({
            id: 10,
            customerId: 1,
            total: 200,
            status: OrderStatus.PENDING,
            createdAt: new Date(),
            customer: { id: 1, name: 'Cliente A', email: 'a@a.com' },
            orderItems: [
              { id: 1, productId: 1, qty: 1, price: 100 },
              { id: 2, productId: 2, qty: 2, price: 50 },
            ],
          }),
        },
      };
      return cb(tx);
    });

    const dto = {
      customerId: 1,
      items: [
        { productId: 1, qty: 1 },
        { productId: 2, qty: 2 },
      ],
    };

    const result = await service.create(dto as any);

    expect(result.total).toBe(200);
    expect(result.status).toBe(OrderStatus.PENDING);
  });

  it('lanzar error si el producto no tiene stock suficiente', async () => {
    prisma.$transaction = jest.fn().mockImplementation(async (cb) => {
      const tx = {
        order: {
          findUnique: jest.fn().mockResolvedValue({
            id: 1,
            status: 'PENDING',
            orderItems: [{ productId: 1, qty: 10 }],
          }),
          update: jest.fn(),
        },
        product: {
          findUnique: jest.fn().mockResolvedValue({
            id: 1,
            name: 'Producto 1',
            stock: 5,
          }),
          update: jest.fn(),
        },
      };
      return cb(tx);
    });

    await expect(service.confirm(1)).rejects.toThrow(ConflictException);
  });
});
