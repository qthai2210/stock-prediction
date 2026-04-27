import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order, OrderSide, OrderType, OrderStatus } from '../../domain/entities/order.entity';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: Order, tx?: unknown): Promise<Order> {
    const client = (tx as any) || this.prisma;
    const prismaOrder = await client.order.create({
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

  async updateStatus(id: number, status: OrderStatus, tx?: unknown): Promise<Order> {
    const client = (tx as any) || this.prisma;
    const prismaOrder = await client.order.update({
      where: { id },
      data: { status },
    });
    return this.mapToEntity(prismaOrder);
  }

  private mapToEntity(prismaOrder: {
    id: number;
    symbol: string;
    type: string;
    orderType: string;
    quantity: number;
    price: number | string | any;
    status: string;
    userId: number;
    createdAt: Date;
    stopPrice: number | string | any | null;
    filledQuantity: number | string | any;
    avgFillPrice: number | string | any | null;
  }): Order {
    return new Order(
      prismaOrder.id,
      prismaOrder.symbol,
      prismaOrder.type as OrderSide,
      prismaOrder.orderType as OrderType,
      prismaOrder.quantity,
      Number(prismaOrder.price),
      prismaOrder.status as OrderStatus,
      prismaOrder.userId,
      prismaOrder.createdAt,
      prismaOrder.stopPrice ? Number(prismaOrder.stopPrice) : undefined,
      Number(prismaOrder.filledQuantity),
      prismaOrder.avgFillPrice ? Number(prismaOrder.avgFillPrice) : undefined,
    );
  }
}
