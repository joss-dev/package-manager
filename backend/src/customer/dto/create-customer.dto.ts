import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del cliente',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(255, { message: 'El nombre no puede superar los 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Email del cliente',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;
}
