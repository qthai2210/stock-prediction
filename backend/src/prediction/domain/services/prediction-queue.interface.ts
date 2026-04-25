import { PredictionResult } from '../entities/prediction.entity';

export interface IPredictionQueue {
  dispatchPredictionJob(symbol: string): Promise<PredictionResult>;
}

export const IPredictionQueue = Symbol('IPredictionQueue');
