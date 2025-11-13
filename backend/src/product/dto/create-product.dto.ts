import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop HP 15', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  name: string;

  @ApiProperty({ example: 'SKU-001', description: 'Código SKU único' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  sku: string;

  @ApiProperty({
    example: 599.99,
    description: 'Precio del producto',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 50, description: 'Cantidad en stock', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  stock: number;
}
