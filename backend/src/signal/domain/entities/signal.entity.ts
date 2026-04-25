export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
}

export enum SignalStatus {
  ACTIVE = 'ACTIVE',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  EXPIRED = 'EXPIRED',
}

export class Signal {
  constructor(
    public readonly id: number,
    public readonly symbol: string,
    public readonly type: SignalType,
    public readonly strategy: string,
    public readonly priceAtTime: number,
    public readonly targetPrice: number,
    public readonly confidence: number,
    public readonly status: SignalStatus,
    public readonly createdAt: Date,
    public readonly actualPrice?: number,
    public readonly profitPct?: number,
    public readonly closedAt?: Date,
  ) {}

  public isSuccess(currentPrice: number): boolean {
    if (this.type === SignalType.BUY) {
      return currentPrice >= this.targetPrice;
    } else if (this.type === SignalType.SELL) {
      return currentPrice <= this.targetPrice;
    }
    return false;
  }

  public calculateProfit(currentPrice: number): number {
    if (this.type === SignalType.BUY) {
      return ((currentPrice - this.priceAtTime) / this.priceAtTime) * 100;
    } else if (this.type === SignalType.SELL) {
      return ((this.priceAtTime - currentPrice) / this.priceAtTime) * 100;
    }
    return 0;
  }
}
