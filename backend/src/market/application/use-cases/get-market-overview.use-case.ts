import { Injectable, Inject } from '@nestjs/common';
import { IMarketProvider } from '../../domain/services/market-provider.interface';

@Injectable()
export class GetMarketOverviewUseCase {
  constructor(
    @Inject(IMarketProvider)
    private readonly marketProvider: IMarketProvider,
  ) {}

  async execute(): Promise<any> {
    return this.marketProvider.getMarketOverview();
  }
}
