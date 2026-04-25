export class MarketOverview {
  constructor(
    public readonly vnIndex: IndexData,
    public readonly hnxIndex: IndexData,
    public readonly upcomIndex: IndexData,
    public readonly topGainers: StockSnapshot[],
    public readonly topLosers: StockSnapshot[],
    public readonly updatedAt: Date,
  ) {}
}

export interface IndexData {
  value: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface StockSnapshot {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}
