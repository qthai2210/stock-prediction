import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { IPredictionQueue } from '../../domain/services/prediction-queue.interface';

export interface SentimentResult {
  error?: string;
  [key: string]: unknown;
}

@Injectable()
export class GetSentimentUseCase {
  constructor(
    @Inject(IPredictionQueue)
    private readonly predictionQueue: IPredictionQueue,
  ) {}

  async execute(symbol: string): Promise<SentimentResult> {
    try {
      const result = (await this.predictionQueue.getSentiment(
        symbol,
      )) as SentimentResult;

      if (result && result.error) {
        throw new InternalServerErrorException(result.error);
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Error communicating with AI Queue for sentiment analysis',
      );
    }
  }
}
