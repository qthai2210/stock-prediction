import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order, OrderSide, OrderType, OrderStatus } from '../../domain/entities/order.entity';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any): Promise<Order> {
    const prismaOrder = await this.prisma.order.create({
      data: {
        symbol: data.symbol,
        type: data.type,
        orderType: data.orderType,
        quantity: data.quantity,
        price: data.price,
        stopPrice: data.stopPrice,
        status: data.status,
        filledQuantity: data.filledQuantity || 0,
        avgFillPrice: data.avgFillPrice,
        userId: data.userId,
      },
    });

    return this.mapToEntity(prismaOrder);
  }

  async findById(id: number): Promise<Order | null> {
    const prismaOrder = await this.prisma.order.findUnique({ where: { id } });
    return prismaOrder ? this.mapToEntity(prismaOrder) : null;
  }

  async findByUser(userId: number): Promise<Order[]> {
    const prismaOrders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return prismaOrders.map(this.mapToEntity);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const prismaOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    return this.mapToEntity(prismaOrder);
  }

  private mapToEntity(prismaOrder: any): Order {
    return new Order(
      prismaOrder.id,
      prismaOrder.symbol,
      prismaOrder.type as OrderSide,
      prismaOrder.orderType as OrderType,
      prismaOrder.quantity,
      prismaOrder.price,
      prismaOrder.status as OrderStatus,
      prismaOrder.userId,
      prismaOrder.createdAt,
      prismaOrder.stopPrice,
      prismaOrder.filledQuantity,
      prismaOrder.avgFillPrice,
    );
  }
}
