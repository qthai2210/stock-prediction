import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../../orders/domain/repositories/order.repository.interface';
import { Order } from '../../../orders/domain/entities/order.entity';

export interface PortfolioResult {
  userId: number;
  totalOrders: number;
  orders: Order[];
}

@Injectable()
export class GetPortfolioUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(userId: number): Promise<PortfolioResult> {
    const orders = await this.orderRepository.findByUser(userId);
    return {
      userId,
      totalOrders: orders.length,
      orders,
    };
  }
}
