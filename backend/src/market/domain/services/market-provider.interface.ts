import { MarketOverview } from '../entities/market-overview.entity';

export interface IMarketProvider {
  getMarketOverview(): Promise<MarketOverview>;
  getLiveQuote(symbol: string): Promise<any>; // Add this for future use
}

export const IMarketProvider = Symbol('IMarketProvider');
