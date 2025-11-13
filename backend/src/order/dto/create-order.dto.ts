import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  qty: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  customerId: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
