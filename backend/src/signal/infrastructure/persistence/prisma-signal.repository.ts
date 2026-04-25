import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ISignalRepository } from '../../domain/repositories/signal.repository.interface';
import { Signal, SignalType, SignalStatus } from '../../domain/entities/signal.entity';

@Injectable()
export class PrismaSignalRepository implements ISignalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any): Promise<Signal> {
    const prismaSignal = await this.prisma.signal.create({
      data: {
        symbol: data.symbol,
        type: data.type,
        strategy: data.strategy,
        priceAtTime: data.priceAtTime,
        targetPrice: data.targetPrice,
        confidence: data.confidence,
        status: data.status,
      },
    });

    return this.mapToEntity(prismaSignal);
  }

  async findActive(): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      where: { status: 'ACTIVE' },
    });
    return prismaSignals.map(this.mapToEntity);
  }

  async update(id: number, data: any): Promise<Signal> {
    const prismaSignal = await this.prisma.signal.update({
      where: { id },
      data,
    });
    return this.mapToEntity(prismaSignal);
  }

  async findAllClosed(): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      where: { NOT: { status: 'ACTIVE' } },
    });
    return prismaSignals.map(this.mapToEntity);
  }

  async findRecent(limit: number): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return prismaSignals.map(this.mapToEntity);
  }

  async findBySymbol(symbol: string, limit: number): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return prismaSignals.map(this.mapToEntity);
  }

  private mapToEntity(prismaSignal: any): Signal {
    return new Signal(
      prismaSignal.id,
      prismaSignal.symbol,
      prismaSignal.type as SignalType,
      prismaSignal.strategy,
      prismaSignal.priceAtTime,
      prismaSignal.targetPrice,
      prismaSignal.confidence,
      prismaSignal.status as SignalStatus,
      prismaSignal.createdAt,
      prismaSignal.actualPrice,
      prismaSignal.profitPct,
      prismaSignal.closedAt,
    );
  }
}
