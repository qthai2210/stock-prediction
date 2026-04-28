import { PredictionResult } from '../entities/prediction.entity';

export interface IPredictionQueue {
  dispatchPredictionJob(symbol: string): Promise<PredictionResult>;
  dispatchBacktestJob(symbol: string, days?: number): Promise<any>;
  getSentiment(symbol: string): Promise<any>;
}

export const IPredictionQueue = Symbol('IPredictionQueue');
