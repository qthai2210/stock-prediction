import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  save(order: Partial<Order> & { userId: number }): Promise<Order>;
  findById(id: number): Promise<Order | null>;
  findByUser(userId: number): Promise<Order[]>;
  updateStatus(id: number, status: string): Promise<Order>;
}

export const IOrderRepository = Symbol('IOrderRepository');
