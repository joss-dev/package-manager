import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear pedido' })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente o producto no encontrado' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar pedidos con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  async findAll(
    @Query() query: GetOrdersDto,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderResponseDto> {
    return this.orderService.findOne(id);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar pedido y descontar stock' })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pedido confirmado y stock descontado',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido ya confirmado o stock insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async confirm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderResponseDto> {
    return this.orderService.confirm(id);
  }
}
