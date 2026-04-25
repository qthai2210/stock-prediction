import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order, OrderStatus } from '../../domain/entities/order.entity';

export interface PlaceOrderInput {
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  userId: number;
}

@Injectable()
export class PlaceOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: PlaceOrderInput): Promise<Order> {
    this.validate(input);

    const orderData = Order.create({
      symbol: input.symbol,
      type: input.type as any,
      orderType: input.orderType as any,
      quantity: input.quantity,
      price: input.price,
      stopPrice: input.stopPrice,
      userId: input.userId,
    });

    return await this.orderRepository.save(orderData);
  }

  private validate(input: PlaceOrderInput) {
    if (!input.symbol?.trim()) throw new BadRequestException('Symbol is required');
    if (input.quantity <= 0) throw new BadRequestException('Quantity must be positive');
    
    if (input.orderType === 'LIMIT' && (!input.price || input.price <= 0)) {
      throw new BadRequestException('Price is required for LIMIT orders');
    }
    
    if ((input.orderType === 'STOP_LOSS' || input.orderType === 'TAKE_PROFIT') && !input.stopPrice) {
      throw new BadRequestException('Stop price is required for this order type');
    }
  }
}
