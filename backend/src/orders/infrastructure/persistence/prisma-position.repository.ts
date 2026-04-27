import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPositionRepository } from '../../domain/repositories/position.repository.interface';
import { Position } from '../../domain/entities/position.entity';
import { Prisma, Position as PrismaPositionModel } from '@prisma/client';

@Injectable()
export class PrismaPositionRepository implements IPositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<Position[]> {
    const prismaPositions = await this.prisma.position.findMany({
      where: { userId },
    });
    return prismaPositions.map((p) => this.mapToEntity(p));
  }

  async findByUserAndSymbol(
    userId: number,
    symbol: string,
  ): Promise<Position | null> {
    const prismaPosition = await this.prisma.position.findUnique({
      where: {
        userId_symbol: { userId, symbol },
      },
    });
    return prismaPosition ? this.mapToEntity(prismaPosition) : null;
  }

  async save(position: Position, tx?: unknown): Promise<Position> {
    const client = (tx as Prisma.TransactionClient) || this.prisma;
    const prismaPosition = await client.position.upsert({
      where: {
        userId_symbol: { userId: position.userId, symbol: position.symbol },
      },
      update: {
        quantity: position.quantity,
        avgPrice: position.avgPrice,
      },
      create: {
        symbol: position.symbol,
        quantity: position.quantity,
        avgPrice: position.avgPrice,
        userId: position.userId,
      },
    });
    return this.mapToEntity(prismaPosition);
  }

  async delete(userId: number, symbol: string, tx?: unknown): Promise<void> {
    const client = (tx as Prisma.TransactionClient) || this.prisma;
    await client.position.delete({
      where: {
        userId_symbol: { userId, symbol },
      },
    });
  }

  private mapToEntity(prismaPosition: PrismaPositionModel): Position {
    return new Position(
      prismaPosition.id,
      prismaPosition.symbol,
      Number(prismaPosition.quantity),
      Number(prismaPosition.avgPrice),
      prismaPosition.userId,
      prismaPosition.updatedAt,
    );
  }
}
