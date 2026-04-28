import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ISignalRepository } from '../../domain/repositories/signal.repository.interface';
import {
  Signal,
  SignalType,
  SignalStatus,
} from '../../domain/entities/signal.entity';
import { Prisma, Signal as PrismaSignalModel } from '@prisma/client';

@Injectable()
export class PrismaSignalRepository implements ISignalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: Partial<Signal>): Promise<Signal> {
    const prismaSignal = await this.prisma.signal.create({
      data: {
        symbol: data.symbol as string,
        type: data.type as string,
        strategy: data.strategy as string,
        priceAtTime: data.priceAtTime as number,
        targetPrice: data.targetPrice as number,
        confidence: data.confidence as number,
        status: data.status as string,
      },
    });

    return this.mapToEntity(prismaSignal);
  }

  async findActive(): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      where: { status: 'ACTIVE' },
    });
    return prismaSignals.map((s) => this.mapToEntity(s));
  }

  async update(id: number, data: Partial<Signal>): Promise<Signal> {
    const updateData: Prisma.SignalUpdateInput = {};
    if (data.status) updateData.status = data.status;
    if (data.actualPrice) updateData.actualPrice = data.actualPrice;
    if (data.profitPct) updateData.profitPct = data.profitPct;
    if (data.closedAt) updateData.closedAt = data.closedAt;

    const prismaSignal = await this.prisma.signal.update({
      where: { id },
      data: updateData,
    });
    return this.mapToEntity(prismaSignal);
  }

  async findAllClosed(): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      where: { NOT: { status: 'ACTIVE' } },
    });
    return prismaSignals.map((s) => this.mapToEntity(s));
  }

  async findRecent(limit: number): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return prismaSignals.map((s) => this.mapToEntity(s));
  }

  async findBySymbol(symbol: string, limit: number): Promise<Signal[]> {
    const prismaSignals = await this.prisma.signal.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return prismaSignals.map((s) => this.mapToEntity(s));
  }

  private mapToEntity(prismaSignal: PrismaSignalModel): Signal {
    return new Signal(
      prismaSignal.id,
      prismaSignal.symbol,
      prismaSignal.type as SignalType,
      prismaSignal.strategy,
      Number(prismaSignal.priceAtTime),
      Number(prismaSignal.targetPrice),
      Number(prismaSignal.confidence),
      prismaSignal.status as SignalStatus,
      prismaSignal.createdAt,
      prismaSignal.actualPrice ? Number(prismaSignal.actualPrice) : undefined,
      prismaSignal.profitPct ? Number(prismaSignal.profitPct) : undefined,
      prismaSignal.closedAt || undefined,
    );
  }
}
