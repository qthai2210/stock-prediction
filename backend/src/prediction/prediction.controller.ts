import { Controller, Get, Param } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictionResult } from './domain/entities/prediction.entity';
import { BacktestResult } from './application/use-cases/run-backtest.use-case';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get(':symbol')
  async getPrediction(
    @Param('symbol') symbol: string,
  ): Promise<PredictionResult> {
    return this.predictionService.predict(symbol);
  }

  @Get(':symbol/backtest')
  async backtest(@Param('symbol') symbol: string): Promise<BacktestResult> {
    return this.predictionService.backtest(symbol);
  }
}
