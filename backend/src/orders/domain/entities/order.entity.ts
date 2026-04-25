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
    public status: OrderStatus,
    public readonly userId: number,
    public readonly createdAt: Date,
    public readonly stopPrice?: number,
    public filledQuantity?: number,
    public avgFillPrice?: number,
  ) {}

  public static create(params: {
    symbol: string;
    type: OrderSide;
    orderType: OrderType;
    quantity: number;
    price?: number;
    stopPrice?: number;
    userId: number;
  }): Partial<Order> & { userId: number } {
    const isMarket = params.orderType === OrderType.MARKET;
    
    return {
      symbol: params.symbol.toUpperCase(),
      type: params.type,
      orderType: params.orderType,
      quantity: params.quantity,
      price: params.price || 0,
      stopPrice: params.stopPrice,
      status: isMarket ? OrderStatus.FILLED : OrderStatus.PENDING,
      filledQuantity: isMarket ? params.quantity : 0,
      avgFillPrice: isMarket ? params.price : undefined,
      userId: params.userId,
    };
  }

  // Domain logic can go here
  public isFilled(): boolean {
    return this.status === OrderStatus.FILLED;
  }
}
