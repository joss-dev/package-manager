import { Expose, Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  sku: string;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Decimal) {
      return parseFloat(value.toString());
    }
    return typeof value === 'number' ? value : parseFloat(String(value));
  })
  price: number;

  @Expose()
  stock: number;
}
