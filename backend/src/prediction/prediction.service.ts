import { Injectable } from '@nestjs/common';
import { GetPredictionUseCase } from './application/use-cases/get-prediction.use-case';
import { RunBacktestUseCase } from './application/use-cases/run-backtest.use-case';

@Injectable()
export class PredictionService {
    constructor(
        private readonly getPredictionUseCase: GetPredictionUseCase,
        private readonly runBacktestUseCase: RunBacktestUseCase,
    ) {}

    async predict(symbol: string): Promise<any> {
        return this.getPredictionUseCase.execute(symbol);
    }

    async backtest(symbol: string, days?: number): Promise<any> {
        return this.runBacktestUseCase.execute(symbol, days);
    }
}
