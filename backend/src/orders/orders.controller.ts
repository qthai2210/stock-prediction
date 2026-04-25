import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/auth.decorators';
import { JwtGuard } from '../auth/jwt.guard';
import { OrdersService } from './orders.service';

interface PlaceOrderDto {
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;
  price: number;
}

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders/place
   * Rate-limited: 5 requests per second per IP
   * Requires valid JWT Bearer token
   * Body: { symbol, type, quantity, price }
   */
  @Post('place')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ orders: { ttl: 1000, limit: 5 } })
  async placeOrder(@Body() dto: PlaceOrderDto, @Request() req: any) {
    return this.ordersService.placeOrder(dto, req.user.sub);
  }

  /**
   * GET /orders/my
   * Fetch authenticated user's order history
   */
  @Get('my')
  async getMyOrders(@Request() req: any) {
    return this.ordersService.getOrdersByUser(req.user.sub);
  }
}
