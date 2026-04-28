import { Injectable, Logger } from '@nestjs/common';
import { PlaceOrderUseCase } from '../orders/application/use-cases/place-order.use-case';
import { GetDashboardUseCase } from './application/use-cases/get-dashboard.use-case';
import { GetSignalPanelUseCase } from './application/use-cases/get-signal-panel.use-case';
import { GetPortfolioUseCase } from './application/use-cases/get-portfolio.use-case';
import { PlaceOrderInput } from '../orders/application/use-cases/place-order.use-case';

@Injectable()
export class BffService {
  private readonly logger = new Logger(BffService.name);

  constructor(
    private readonly getDashboardUseCase: GetDashboardUseCase,
    private readonly getSignalPanelUseCase: GetSignalPanelUseCase,
    private readonly getPortfolioUseCase: GetPortfolioUseCase,
    private readonly placeOrderUseCase: PlaceOrderUseCase,
  ) {}

  async getDashboard() {
    return this.getDashboardUseCase.execute();
  }

  async getSignalPanel(symbol: string) {
    return this.getSignalPanelUseCase.execute(symbol);
  }

  async placeOrder(dto: Omit<PlaceOrderInput, 'userId'>, userId: number) {
    const input: PlaceOrderInput = { ...dto, userId };
    return this.placeOrderUseCase.execute(input);
  }

  async getPortfolio(userId: number) {
    return this.getPortfolioUseCase.execute(userId);
  }
}
