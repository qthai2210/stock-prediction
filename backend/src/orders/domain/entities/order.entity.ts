export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LOSS = 'STOP_LOSS',
  TAKE_PROFIT = 'TAKE_PROFIT',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export class Order {
  constructor(
    public readonly id: number,
    public readonly symbol: string,
    public readonly type: OrderSide,
    public readonly orderType: OrderType,
    public readonly quantity: number,
    public readonly price: number,
    public readonly status: OrderStatus,
    public readonly userId: number,
    public readonly createdAt: Date,
    public readonly stopPrice?: number,
    public readonly filledQuantity?: number,
    public readonly avgFillPrice?: number,
  ) {}

  // Domain logic can go here
  public isFilled(): boolean {
    return this.status === OrderStatus.FILLED;
  }
}
