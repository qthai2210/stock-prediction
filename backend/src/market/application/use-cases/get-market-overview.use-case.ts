import { Injectable, Inject } from '@nestjs/common';
import { IMarketProvider } from '../../domain/services/market-provider.interface';
import { MarketOverview } from '../../domain/entities/market-overview.entity';

@Injectable()
export class GetMarketOverviewUseCase {
  constructor(
    @Inject(IMarketProvider)
    private readonly marketProvider: IMarketProvider,
  ) {}

  async execute(): Promise<MarketOverview> {
    return this.marketProvider.getMarketOverview();
  }
}
