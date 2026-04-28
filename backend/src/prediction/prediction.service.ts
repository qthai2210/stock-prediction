import { Injectable } from '@nestjs/common';
import { GetPredictionUseCase } from './application/use-cases/get-prediction.use-case';
import {
  RunBacktestUseCase,
  BacktestResult,
} from './application/use-cases/run-backtest.use-case';
import { PredictionResult } from './domain/entities/prediction.entity';

@Injectable()
export class PredictionService {
  constructor(
    private readonly getPredictionUseCase: GetPredictionUseCase,
    private readonly runBacktestUseCase: RunBacktestUseCase,
  ) {}

  async predict(symbol: string): Promise<PredictionResult> {
    return this.getPredictionUseCase.execute(symbol);
  }

  async backtest(symbol: string, days?: number): Promise<BacktestResult> {
    return this.runBacktestUseCase.execute(symbol, days);
  }
}
