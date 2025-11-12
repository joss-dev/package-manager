import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHello(): Promise<string> {
    const count = await this.prismaService.product.count();
    return `Hello World! There are ${count} products in the database.`;
  }
}
