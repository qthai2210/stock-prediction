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
}
