import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CustomerResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Juan Pérez' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @Expose()
  email: string;
}
