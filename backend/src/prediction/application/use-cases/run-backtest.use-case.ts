import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { IPredictionQueue } from '../../domain/services/prediction-queue.interface';

@Injectable()
export class RunBacktestUseCase {
  constructor(
    @Inject(IPredictionQueue)
    private readonly predictionQueue: IPredictionQueue,
  ) {}

  async execute(symbol: string, days?: number): Promise<any> {
    try {
      const result = await this.predictionQueue.dispatchBacktestJob(symbol, days);
      
      if (result && result.error) {
        throw new InternalServerErrorException(result.error);
      }

      return result;
    } catch (error: any) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(error.message || 'Error communicating with AI Queue for backtesting');
    }
  }
}
