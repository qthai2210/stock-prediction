import { Controller, Get } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketOverview } from './domain/entities/market-overview.entity';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('overview')
  async getOverview(): Promise<MarketOverview> {
    return this.marketService.getMarketOverview();
  }
}
