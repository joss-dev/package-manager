import { Expose, Transform, Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderItemResponseDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  @Type(() => Object)
  product: {
    id: number;
    name: string;
    sku: string;
  };

  @Expose()
  qty: number;

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
  @Expose()
  id: number;

  @Expose()
  customerId: number;

  @Expose()
  @Type(() => Object)
  customer: {
    id: number;
    name: string;
    email: string;
  };

  @Expose()
  status: string;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Decimal) {
      return parseFloat(value.toString());
    }
    return typeof value === 'number' ? value : parseFloat(String(value));
  })
  total: number;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => OrderItemResponseDto)
  orderItems?: OrderItemResponseDto[];
}
