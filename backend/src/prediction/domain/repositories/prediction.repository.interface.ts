import { Prediction } from '../entities/prediction.entity';

export interface IPredictionRepository {
  save(prediction: Partial<Prediction>): Promise<Prediction>;
  findLatestBySymbol(symbol: string): Promise<Prediction | null>;
  findManyBySymbol(symbol: string, limit: number): Promise<Prediction[]>;
}

export const IPredictionRepository = Symbol('IPredictionRepository');
