import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 2, description: 'Cantidad', minimum: 1 })
  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  qty: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID del cliente' })
  @IsInt()
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  customerId: number;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Productos del pedido',
    example: [
      { productId: 1, qty: 2 },
      { productId: 2, qty: 1 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
