import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GenerateSignalsUseCase } from './application/use-cases/generate-signals.use-case';
import { EvaluateSignalAccuracyUseCase } from './application/use-cases/evaluate-signal-accuracy.use-case';
import { GetSignalStatsUseCase } from './application/use-cases/get-signal-stats.use-case';

@Injectable()
export class SignalService {
  private readonly logger = new Logger(SignalService.name);

  constructor(
    private readonly generateSignalsUseCase: GenerateSignalsUseCase,
    private readonly evaluateSignalAccuracyUseCase: EvaluateSignalAccuracyUseCase,
    private readonly getSignalStatsUseCase: GetSignalStatsUseCase,
  ) {}

  @Cron('*/30 * * * * *')
  async generateSignals() {
    await this.generateSignalsUseCase.execute();
  }

  @Cron('0 */5 * * * *')
  async validateSignalAccuracy() {
    await this.evaluateSignalAccuracyUseCase.execute();
  }

  async getSignalStats() {
    return this.getSignalStatsUseCase.execute();
  }
}
