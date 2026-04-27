import { Controller, Get, Param } from '@nestjs/common';
import { GetHistoricalSignalsUseCase } from './application/use-cases/get-historical-signals.use-case';
import { GetHistoricalPredictionsUseCase } from './application/use-cases/get-historical-predictions.use-case';

@Controller('history')
export class HistoryController {
  constructor(
    private readonly getHistoricalSignalsUseCase: GetHistoricalSignalsUseCase,
    private readonly getHistoricalPredictionsUseCase: GetHistoricalPredictionsUseCase,
  ) {}

  @Get('signals/:symbol')
  async getSignals(@Param('symbol') symbol: string) {
    return this.getHistoricalSignalsUseCase.execute(symbol);
  }

  @Get('predictions/:symbol')
  async getPredictions(@Param('symbol') symbol: string) {
    return this.getHistoricalPredictionsUseCase.execute(symbol);
  }
}
