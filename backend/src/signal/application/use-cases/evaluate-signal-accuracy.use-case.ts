import { Injectable, Inject, Logger } from '@nestjs/common';
import { ISignalRepository } from '../../domain/repositories/signal.repository.interface';
import { SignalStatus, SignalType } from '../../domain/entities/signal.entity';
import { GetPredictionUseCase } from '../../../prediction/application/use-cases/get-prediction.use-case';

@Injectable()
export class EvaluateSignalAccuracyUseCase {
  private readonly logger = new Logger(EvaluateSignalAccuracyUseCase.name);

  constructor(
    @Inject(ISignalRepository)
    private readonly signalRepository: ISignalRepository,
    private readonly getPredictionUseCase: GetPredictionUseCase,
  ) {}

  async execute() {
    this.logger.log('📊 Evaluating signal accuracy...');
    const activeSignals = await this.signalRepository.findActive();

    for (const signal of activeSignals) {
      try {
        const marketData = await this.getPredictionUseCase.execute(signal.symbol);
        const currentPrice = marketData.latest_close;

        let status: SignalStatus = SignalStatus.ACTIVE;
        let profitPct = signal.calculateProfit(currentPrice);

        if (signal.type === SignalType.BUY) {
          if (currentPrice >= signal.targetPrice) status = SignalStatus.SUCCESS;
          else if (profitPct < -4) status = SignalStatus.FAIL;
        } else {
          if (currentPrice <= signal.targetPrice) status = SignalStatus.SUCCESS;
          else if (profitPct < -4) status = SignalStatus.FAIL;
        }

        if (status !== SignalStatus.ACTIVE) {
          await this.signalRepository.update(signal.id, {
            status,
            actualPrice: currentPrice,
            profitPct,
            closedAt: new Date(),
          });
        }
      } catch (e) {
        this.logger.error(`Error evaluating signal ${signal.id}: ${e.message}`);
      }
    }
  }
}
