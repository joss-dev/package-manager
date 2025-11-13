import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    return await this.prismaService.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: dto.customerId },
      });

      if (!customer) {
        throw new NotFoundException(
          `Cliente con ID ${dto.customerId} no encontrado`,
        );
      }

      const productIds = dto.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('Uno o más productos no existen');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of dto.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${item.productId} no encontrado`,
          );
        }
      }

      let total = 0;
      const orderItemsData = dto.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${item.productId} no encontrado`,
          );
        }
        const itemTotal = Number(product.price) * item.qty;
        total += itemTotal;

        return {
          productId: item.productId,
          qty: item.qty,
          price: product.price,
        };
      });

      const order = await tx.order.create({
        data: {
          customerId: dto.customerId,
          total,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      });

      return {
        id: order.id,
        customerId: order.customerId,
        customer: {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
        },
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          product: item.product,
          qty: item.qty,
          price: Number(item.price),
        })),
      };
    });
  }

  async findAll(
    dto: GetOrdersDto,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    const { limit, offset, status, customerId } = dto;

    const whereClause = this.buildWhereClause(status, customerId);

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.order.count({ where: whereClause }),
    ]);

    const data = orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
      },
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        qty: item.qty,
        price: Number(item.price),
      })),
    }));

    return {
      total,
      limit,
      offset,
      order: 'desc',
      sortBy: 'createdAt',
      data,
      status,
      customerId,
      hasMore: offset + limit < total,
    };
  }

  async findOne(id: number): Promise<OrderResponseDto> {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return {
      id: order.id,
      customerId: order.customerId,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
      },
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        qty: item.qty,
        price: Number(item.price),
      })),
    };
  }

  async confirm(id: number): Promise<OrderResponseDto> {
    return await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      if (order.status !== (OrderStatus.PENDING as string)) {
        throw new BadRequestException(
          `Solo se pueden confirmar pedidos en estado ${OrderStatus.PENDING}. Estado actual: ${order.status}`,
        );
      }

      for (const item of order.orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${item.productId} no encontrado`,
          );
        }

        if (product.stock < item.qty) {
          throw new ConflictException(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Requerido: ${item.qty}`,
          );
        }
      }

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });
      }

      const confirmedOrder = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CONFIRMED },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      });

      return {
        id: confirmedOrder.id,
        customerId: confirmedOrder.customerId,
        customer: {
          id: confirmedOrder.customer.id,
          name: confirmedOrder.customer.name,
          email: confirmedOrder.customer.email,
        },
        status: confirmedOrder.status,
        total: Number(confirmedOrder.total),
        createdAt: confirmedOrder.createdAt,
        orderItems: confirmedOrder.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          product: item.product,
          qty: item.qty,
          price: Number(item.price),
        })),
      };
    });
  }

  private buildWhereClause(
    status?: string,
    customerId?: number,
  ): Prisma.OrderWhereInput {
    const whereClause: Prisma.OrderWhereInput = {};

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    return whereClause;
  }
}
