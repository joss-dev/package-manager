import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderItemResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  productId: number;

  @ApiProperty({
    example: { id: 1, name: 'Laptop HP 15', sku: 'SKU-001' },
    description: 'Información del producto',
  })
  @Expose()
  @Type(() => Object)
  product: {
    id: number;
    name: string;
    sku: string;
  };

  @ApiProperty({ example: 2 })
  @Expose()
  qty: number;

  @ApiProperty({ example: 599.99 })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Decimal) {
      return parseFloat(value.toString());
    }
    return typeof value === 'number' ? value : parseFloat(String(value));
  })
  price: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  customerId: number;

  @ApiProperty({
    example: { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com' },
    description: 'Información del cliente',
  })
  @Expose()
  @Type(() => Object)
  customer: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'CONFIRMED'] })
  @Expose()
  status: string;

  @ApiProperty({ example: 1199.98 })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Decimal) {
      return parseFloat(value.toString());
    }
    return typeof value === 'number' ? value : parseFloat(String(value));
  })
  total: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: [OrderItemResponseDto], required: false })
  @Expose()
  @Type(() => OrderItemResponseDto)
  orderItems?: OrderItemResponseDto[];
}
