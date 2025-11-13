import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Laptop HP 15' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'SKU-001' })
  @Expose()
  sku: string;

  @ApiProperty({ example: 599.99 })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Decimal) {
      return parseFloat(value.toString());
    }
    return typeof value === 'number' ? value : parseFloat(String(value));
  })
  price: number;

  @ApiProperty({ example: 50 })
  @Expose()
  stock: number;
}
