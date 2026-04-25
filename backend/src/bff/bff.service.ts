import { Injectable, Logger } from '@nestjs/common';
import { OrdersService, PlaceOrderDto } from '../orders/orders.service';
import { GetDashboardUseCase } from './application/use-cases/get-dashboard.use-case';
import { GetSignalPanelUseCase } from './application/use-cases/get-signal-panel.use-case';

@Injectable()
export class BffService {
  private readonly logger = new Logger(BffService.name);

  constructor(
    private readonly getDashboardUseCase: GetDashboardUseCase,
    private readonly getSignalPanelUseCase: GetSignalPanelUseCase,
    private readonly ordersService: OrdersService,
  ) {}

  async getDashboard() {
    return this.getDashboardUseCase.execute();
  }

  async getSignalPanel(symbol: string) {
    return this.getSignalPanelUseCase.execute(symbol);
  }

  async placeOrder(dto: PlaceOrderDto, userId: number) {
    return this.ordersService.placeOrder(dto, userId);
  }

  async getPortfolio(userId: number) {
    const orders = await this.ordersService.getOrdersByUser(userId);
    return {
      userId,
      totalOrders: orders.length,
      orders,
    };
  }
}
