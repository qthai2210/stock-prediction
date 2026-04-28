import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPredictionRepository } from '../../domain/repositories/prediction.repository.interface';
import { Prediction } from '../../domain/entities/prediction.entity';
import { Prediction as PrismaPredictionModel } from '@prisma/client';

export interface PredictionSaveData {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  changePercent: number;
  rsi: number;
  macd: number;
}

@Injectable()
export class PrismaPredictionRepository implements IPredictionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: PredictionSaveData): Promise<Prediction> {
    const prismaPrediction = await this.prisma.prediction.create({
      data: {
        symbol: data.symbol,
        currentPrice: data.currentPrice,
        predictedPrice: data.predictedPrice,
        changePercent: data.changePercent,
        rsi: data.rsi,
        macd: data.macd,
      },
    });

    return this.mapToEntity(prismaPrediction);
  }

  async findLatestBySymbol(symbol: string): Promise<Prediction | null> {
    const prismaPrediction = await this.prisma.prediction.findFirst({
      where: { symbol },
      orderBy: { createdAt: 'desc' },
    });
    return prismaPrediction ? this.mapToEntity(prismaPrediction) : null;
  }

  async findManyBySymbol(symbol: string, limit: number): Promise<Prediction[]> {
    const prismaPredictions = await this.prisma.prediction.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return prismaPredictions.map((p) => this.mapToEntity(p));
  }

  private mapToEntity(prismaPrediction: PrismaPredictionModel): Prediction {
    return new Prediction(
      prismaPrediction.id,
      prismaPrediction.symbol,
      Number(prismaPrediction.currentPrice),
      Number(prismaPrediction.predictedPrice),
      Number(prismaPrediction.changePercent),
      Number(prismaPrediction.rsi),
      Number(prismaPrediction.macd),
      prismaPrediction.createdAt,
    );
  }
}
