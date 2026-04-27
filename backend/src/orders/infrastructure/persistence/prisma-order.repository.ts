import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import {
  Order,
  OrderSide,
  OrderType,
  OrderStatus,
} from '../../domain/entities/order.entity';
import { Prisma, Order as PrismaOrderModel } from '@prisma/client';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: Order, tx?: unknown): Promise<Order> {
    const client = (tx as Prisma.TransactionClient) || this.prisma;
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
    return prismaOrders.map((order) => this.mapToEntity(order));
  }

  async updateStatus(
    id: number,
    status: OrderStatus,
    tx?: unknown,
  ): Promise<Order> {
    const client = (tx as Prisma.TransactionClient) || this.prisma;
    const prismaOrder = await client.order.update({
      where: { id },
      data: { status },
    });
    return this.mapToEntity(prismaOrder);
  }

  private mapToEntity(prismaOrder: PrismaOrderModel): Order {
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
