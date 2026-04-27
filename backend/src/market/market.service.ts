import { Injectable } from '@nestjs/common';
import { GetMarketOverviewUseCase } from './application/use-cases/get-market-overview.use-case';
import { MarketOverview } from './domain/entities/market-overview.entity';

@Injectable()
export class MarketService {
  constructor(
    private readonly getMarketOverviewUseCase: GetMarketOverviewUseCase,
  ) {}

  async getMarketOverview(): Promise<MarketOverview> {
    return this.getMarketOverviewUseCase.execute();
  }
}
