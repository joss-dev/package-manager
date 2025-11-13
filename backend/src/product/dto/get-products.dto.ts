import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetProductsDto {
  @ApiPropertyOptional({
    description: 'Buscar en nombre o SKU',
    example: 'Laptop',
  })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Precio mínimo',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Precio máximo',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({
    description: 'Offset para paginación',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @ApiPropertyOptional({
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Campo para ordenar',
    enum: ['id', 'name', 'price', 'stock', 'sku'],
    default: 'id',
  })
  @IsOptional()
  @IsIn(['id', 'name', 'price', 'stock', 'sku'])
  sortBy: 'id' | 'name' | 'price' | 'stock' | 'sku' = 'id';
}
