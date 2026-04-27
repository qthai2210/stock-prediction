import { Injectable } from '@nestjs/common';
import { IPredictionQueue } from '../../domain/services/prediction-queue.interface';
import { PredictionResult } from '../../domain/entities/prediction.entity';
import { QueueService } from '../../../queue/queue.service';

@Injectable()
export class BullPredictionQueue implements IPredictionQueue {
  constructor(private readonly queueService: QueueService) {}

  async dispatchPredictionJob(symbol: string): Promise<PredictionResult> {
    return (await this.queueService.dispatchPredictionJob(
      symbol,
    )) as PredictionResult;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchBacktestJob(_symbol: string, _days?: number): Promise<unknown> {
    // For now, redirect to the same pattern if Bull is used,
    // but ideally we should update QueueService to handle backtests too.
    return Promise.resolve({
      error: 'Backtesting not yet implemented for Bull queue',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSentiment(_symbol: string): Promise<unknown> {
    return Promise.resolve({
      error: 'Sentiment analysis not yet implemented for Bull queue',
    });
  }
}
