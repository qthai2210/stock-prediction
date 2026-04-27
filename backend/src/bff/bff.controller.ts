import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/auth.decorators';
import { JwtGuard } from '../auth/jwt.guard';
import { BffService } from './bff.service';
import { JwtPayload } from '../auth/domain/services/token.service.interface';

interface PlaceOrderDto {
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;
  price: number;
}

/**
 * BFF (Backend for Frontend) Controller
 *
 * Acts as an L7 aggregation layer — the frontend makes 1 call
 * instead of 3-4 individual calls to different services.
 *
 * Public routes:  GET /bff/dashboard, GET /bff/signals/:symbol
 * Protected routes: POST /bff/orders/place (JWT + rate limit)
 */
@Controller('bff')
@UseGuards(JwtGuard)
export class BffController {
  constructor(private readonly bffService: BffService) {}

  /**
   * GET /bff/dashboard
   * Aggregates: prediction + market overview + latest news
   * Frontend Dashboard page uses this single endpoint.
   * Public — no auth required to view market data.
   */
  @Public()
  @Get('dashboard')
  async getDashboard() {
    return this.bffService.getDashboard();
  }

  /**
   * GET /bff/signals/:symbol
   * Aggregates: active signals + recent prediction history
   * Public — read-only market data.
   */
  @Public()
  @Get('signals/:symbol')
  async getSignals(@Param('symbol') symbol: string) {
    return this.bffService.getSignalPanel(symbol);
  }

  /**
   * POST /bff/orders/place
   * Protected: requires valid JWT
   * Rate-limited: 5 requests per second per IP
   */
  @Post('orders/place')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ orders: { ttl: 1000, limit: 5 } })
  async placeOrder(@Body() dto: PlaceOrderDto, @Request() req: { user: JwtPayload }) {
    return this.bffService.placeOrder(dto, req.user.sub);
  }

  /**
   * GET /bff/portfolio
   * Returns current user's order history (protected)
   */
  @Get('portfolio')
  async getPortfolio(@Request() req: { user: JwtPayload }) {
    return this.bffService.getPortfolio(req.user.sub);
  }
}
