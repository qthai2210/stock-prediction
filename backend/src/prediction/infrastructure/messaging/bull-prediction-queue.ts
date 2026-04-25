import { Injectable } from '@nestjs/common';
import { IPredictionQueue } from '../../domain/services/prediction-queue.interface';
import { PredictionResult } from '../../domain/entities/prediction.entity';
import { QueueService } from '../../../queue/queue.service';

@Injectable()
export class BullPredictionQueue implements IPredictionQueue {
  constructor(private readonly queueService: QueueService) {}

  async dispatchPredictionJob(symbol: string): Promise<PredictionResult> {
    return this.queueService.dispatchPredictionJob(symbol);
  }

  async dispatchBacktestJob(symbol: string, days?: number): Promise<any> {
    // For now, redirect to the same pattern if Bull is used, 
    // but ideally we should update QueueService to handle backtests too.
    return { error: 'Backtesting not yet implemented for Bull queue' };
  }

  async getSentiment(symbol: string): Promise<any> {
    return { error: 'Sentiment analysis not yet implemented for Bull queue' };
  }
}
