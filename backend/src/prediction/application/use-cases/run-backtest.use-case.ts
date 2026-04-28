import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { IPredictionQueue } from '../../domain/services/prediction-queue.interface';

export interface BacktestResult {
  error?: string;
  [key: string]: unknown;
}

@Injectable()
export class RunBacktestUseCase {
  constructor(
    @Inject(IPredictionQueue)
    private readonly predictionQueue: IPredictionQueue,
  ) {}

  async execute(symbol: string, days?: number): Promise<BacktestResult> {
    try {
      const result = (await this.predictionQueue.dispatchBacktestJob(
        symbol,
        days,
      )) as BacktestResult;

      if (result && result.error) {
        throw new InternalServerErrorException(result.error);
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Error communicating with AI Queue for backtesting',
      );
    }
  }
}
