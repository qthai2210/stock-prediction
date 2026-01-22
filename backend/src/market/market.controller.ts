import { Controller, Get } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
    constructor(private readonly marketService: MarketService) { }

    @Get('overview')
    async getOverview() {
        return this.marketService.getMarketOverview();
    }
}
