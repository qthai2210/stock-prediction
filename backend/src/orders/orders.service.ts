import { Injectable, Inject, Logger } from '@nestjs/common';
import { IOrderRepository } from './domain/repositories/order.repository.interface';
import { PlaceOrderUseCase, PlaceOrderInput } from './application/use-cases/place-order.use-case';

export interface PlaceOrderDto {
  symbol: string;         
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;       
  price?: number;          
  stopPrice?: number;      
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    private readonly placeOrderUseCase: PlaceOrderUseCase
  ) {}

  async placeOrder(dto: PlaceOrderDto, userId: number) {
    const input: PlaceOrderInput = { ...dto, userId };
    const order = await this.placeOrderUseCase.execute(input);

    this.logger.log(
      `Order placed: ${order.orderType} ${order.type} ${order.quantity}x${order.symbol} by user ${userId}`,
    );

    return order;
  }

  async getOrdersByUser(userId: number) {
    return this.orderRepository.findByUser(userId);
  }
}
