export class Position {
  constructor(
    public readonly id: number | null,
    public readonly symbol: string,
    public readonly quantity: number,
    public readonly avgPrice: number,
    public readonly userId: number,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: {
    symbol: string;
    quantity: number;
    avgPrice: number;
    userId: number;
  }): Position {
    return new Position(null, data.symbol, data.quantity, data.avgPrice, data.userId);
  }
}
