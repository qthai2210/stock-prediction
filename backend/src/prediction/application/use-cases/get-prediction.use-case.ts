import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { IPredictionRepository } from '../../domain/repositories/prediction.repository.interface';
import { IPredictionQueue } from '../../domain/services/prediction-queue.interface';
import { PredictionResult } from '../../domain/entities/prediction.entity';

@Injectable()
export class GetPredictionUseCase {
  constructor(
    @Inject(IPredictionRepository)
    private readonly predictionRepository: IPredictionRepository,
    @Inject(IPredictionQueue)
    private readonly predictionQueue: IPredictionQueue,
  ) {}

  async execute(symbol: string): Promise<any> {
    try {
      const result = await this.predictionQueue.dispatchPredictionJob(symbol);

      if (result && result.error) {
        throw new InternalServerErrorException(result.error);
      }

      if (result && result.status === 'training_required') {
        return {
          status: 'processing',
          message: `Training model for ${symbol} in background. Please poll for updates.`
        };
      }

      // Save to Database if it's a freshly calculated prediction
      if (result && result.cached === false && result.indicators) {
        this.predictionRepository.save({
          symbol: result.symbol || symbol,
          currentPrice: result.latest_close || 0,
          predictedPrice: result.prediction || 0,
          changePercent: result.change_pct || 0,
          rsi: result.indicators.rsi || 0,
          macd: result.indicators.macd || 0,
        }).catch(e => console.error("Failed to save prediction to DB", e));
      }

      return result;
    } catch (error: any) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(error.message || 'Error communicating with AI Queue');
    }
  }
}
