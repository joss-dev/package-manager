import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`El SKU ${dto.sku} ya está en uso`);
    }

    const product = await this.prismaService.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock,
      },
    });

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      stock: product.stock,
    };
  }

  async findAll(
    dto: GetProductsDto,
  ): Promise<PaginatedResponse<ProductResponseDto>> {
    const { limit, offset, order, sortBy, minPrice, maxPrice, search } = dto;

    const whereClause = this.buildWhereClause(search, minPrice, maxPrice);

    const [products, total] = await Promise.all([
      this.prismaService.product.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        orderBy: { [sortBy]: order },
      }),
      this.prismaService.product.count({ where: whereClause }),
    ]);

    const data = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      stock: product.stock,
    }));

    return {
      total,
      limit,
      offset,
      order,
      sortBy,
      data,
      search,
      minPrice,
      maxPrice,
      hasMore: offset + limit < total,
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      stock: product.stock,
    };
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    await this.findOne(id);

    if (dto.sku) {
      const existing = await this.findBySku(dto.sku);
      if (existing && existing.id !== id) {
        throw new ConflictException(`El SKU ${dto.sku} ya está en uso`);
      }
    }
    const product = await this.prismaService.product.update({
      where: { id },
      data: {
        name: dto.name,
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock,
      },
    });

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      stock: product.stock,
    };
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prismaService.product.delete({
      where: { id },
    });
  }

  private buildWhereClause(
    search?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Prisma.ProductWhereInput {
    const whereClause: Prisma.ProductWhereInput = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) whereClause.price.gte = minPrice;
      if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
    }

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return whereClause;
  }

  private findBySku(sku: string): Promise<Product | null> {
    return this.prismaService.product.findUnique({
      where: { sku },
    });
  }
}
