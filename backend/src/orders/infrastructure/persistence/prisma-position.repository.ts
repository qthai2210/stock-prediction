import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPositionRepository } from '../../domain/repositories/position.repository.interface';
import { Position } from '../../domain/entities/position.entity';

@Injectable()
export class PrismaPositionRepository implements IPositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<Position[]> {
    const prismaPositions = await this.prisma.position.findMany({
      where: { userId },
    });
    return prismaPositions.map(this.mapToEntity);
  }

  async findByUserAndSymbol(userId: number, symbol: string): Promise<Position | null> {
    const prismaPosition = await this.prisma.position.findUnique({
      where: {
        userId_symbol: { userId, symbol },
      },
    });
    return prismaPosition ? this.mapToEntity(prismaPosition) : null;
  }

  async save(position: Position): Promise<Position> {
    const prismaPosition = await this.prisma.position.upsert({
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

  async delete(userId: number, symbol: string): Promise<void> {
    await this.prisma.position.delete({
      where: {
        userId_symbol: { userId, symbol },
      },
    });
  }

  private mapToEntity(prismaPosition: any): Position {
    return new Position(
      prismaPosition.id,
      prismaPosition.symbol,
      prismaPosition.quantity,
      prismaPosition.avgPrice,
      prismaPosition.userId,
      prismaPosition.updatedAt,
    );
  }
}
