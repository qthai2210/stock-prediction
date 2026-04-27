import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { SignalModule } from '../signal/signal.module';
import { PredictionModule } from '../prediction/prediction.module';
import { GetHistoricalSignalsUseCase } from './application/use-cases/get-historical-signals.use-case';
import { GetHistoricalPredictionsUseCase } from './application/use-cases/get-historical-predictions.use-case';

@Module({
  imports: [SignalModule, PredictionModule],
  controllers: [HistoryController],
  providers: [GetHistoricalSignalsUseCase, GetHistoricalPredictionsUseCase],
})
export class HistoryModule {}
