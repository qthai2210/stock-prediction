import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { IMarketProvider } from './domain/services/market-provider.interface';
import { PythonMarketProvider } from './infrastructure/external/python-market-provider';
import { GetMarketOverviewUseCase } from './application/use-cases/get-market-overview.use-case';

@Module({
  controllers: [MarketController],
  providers: [
    MarketService,
    GetMarketOverviewUseCase,
    {
      provide: IMarketProvider,
      useClass: PythonMarketProvider,
    },
  ],
  exports: [MarketService, GetMarketOverviewUseCase],
})
export class MarketModule {}
