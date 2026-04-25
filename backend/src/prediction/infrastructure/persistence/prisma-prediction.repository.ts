import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPredictionRepository } from '../../domain/repositories/prediction.repository.interface';
import { Prediction } from '../../domain/entities/prediction.entity';

@Injectable()
export class PrismaPredictionRepository implements IPredictionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any): Promise<Prediction> {
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
    return prismaPredictions.map(this.mapToEntity);
  }

  private mapToEntity(prismaPrediction: any): Prediction {
    return new Prediction(
      prismaPrediction.id,
      prismaPrediction.symbol,
      prismaPrediction.currentPrice,
      prismaPrediction.predictedPrice,
      prismaPrediction.changePercent,
      prismaPrediction.rsi,
      prismaPrediction.macd,
      prismaPrediction.createdAt,
    );
  }
}
