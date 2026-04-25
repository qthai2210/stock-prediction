import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from '../auth/jwt.guard';
import { PlaceOrderUseCase, PlaceOrderInput } from './application/use-cases/place-order.use-case';
import { GetPortfolioUseCase } from './application/use-cases/get-portfolio.use-case';
import { IOrderRepository } from './domain/repositories/order.repository.interface';

interface PlaceOrderDto {
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
}

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(
    private readonly placeOrderUseCase: PlaceOrderUseCase,
    private readonly getPortfolioUseCase: GetPortfolioUseCase,
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Post('place')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ orders: { ttl: 1000, limit: 5 } })
  async placeOrder(@Body() dto: PlaceOrderDto, @Request() req: any) {
    const input: PlaceOrderInput = {
      ...dto,
      price: dto.price ?? 0,
      userId: req.user.sub,
    };
    return this.placeOrderUseCase.execute(input);
  }

  @Get('my')
  async getMyOrders(@Request() req: any) {
    return this.orderRepository.findByUser(req.user.sub);
  }

  @Get('portfolio')
  async getPortfolio(@Request() req: any) {
    return this.getPortfolioUseCase.execute(req.user.sub);
  }
}
