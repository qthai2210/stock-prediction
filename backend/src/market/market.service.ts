import { Injectable } from '@nestjs/common';
import { GetMarketOverviewUseCase } from './application/use-cases/get-market-overview.use-case';

@Injectable()
export class MarketService {
    constructor(
        private readonly getMarketOverviewUseCase: GetMarketOverviewUseCase,
    ) {}

    async getMarketOverview(): Promise<any> {
        return this.getMarketOverviewUseCase.execute();
    }
}
