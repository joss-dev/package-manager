import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const existing = await this.prismaService.customer.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const customer = await this.prismaService.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
      },
    });

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    };
  }

  async findAll(
    dto: GetCustomersDto,
  ): Promise<PaginatedResponse<CustomerResponseDto>> {
    const { limit, offset, search } = dto;

    const whereClause = this.buildWhereClause(search);

    const [customers, total] = await Promise.all([
      this.prismaService.customer.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { id: 'desc' },
      }),
      this.prismaService.customer.count({ where: whereClause }),
    ]);

    const data = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
    }));

    return {
      total,
      limit,
      offset,
      order: 'desc',
      sortBy: 'id',
      data,
      search,
      hasMore: offset + limit < total,
    };
  }

  async findOne(id: number): Promise<CustomerResponseDto> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    };
  }

  async update(
    id: number,
    dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.prismaService.customer.findFirst({
        where: {
          email: dto.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('El email ya está en uso por otro cliente');
      }
    }

    const customer = await this.prismaService.customer.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
      },
    });

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    };
  }

  async remove(id: number): Promise<void> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
      include: { orders: true },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    if (customer.orders.length > 0) {
      throw new ConflictException(
        'No se puede eliminar un cliente con pedidos asociados',
      );
    }

    await this.prismaService.customer.delete({
      where: { id },
    });
  }

  private buildWhereClause(search?: string): Prisma.CustomerWhereInput {
    const whereClause: Prisma.CustomerWhereInput = {};

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return whereClause;
  }
}
