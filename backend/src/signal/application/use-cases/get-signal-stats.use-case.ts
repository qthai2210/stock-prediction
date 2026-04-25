import { Injectable, Inject } from '@nestjs/common';
import { ISignalRepository } from '../../domain/repositories/signal.repository.interface';
import { SignalStatus } from '../../domain/entities/signal.entity';

@Injectable()
export class GetSignalStatsUseCase {
  constructor(
    @Inject(ISignalRepository)
    private readonly signalRepository: ISignalRepository,
  ) {}

  async execute() {
    const closedSignals = await this.signalRepository.findAllClosed();

    const strategyStats = {};
    closedSignals.forEach(s => {
      if (!strategyStats[s.strategy]) {
        strategyStats[s.strategy] = { total: 0, success: 0, profit: 0 };
      }
      const st = strategyStats[s.strategy];
      st.total++;
      if (s.status === SignalStatus.SUCCESS) st.success++;
      st.profit += s.profitPct || 0;
    });

    const recentSignals = await this.signalRepository.findRecent(10);

    return {
      summary: {
        total: closedSignals.length,
        winRate: closedSignals.length > 0 
          ? (closedSignals.filter(s => s.status === SignalStatus.SUCCESS).length / (closedSignals.filter(s => s.status !== SignalStatus.EXPIRED).length || 1) * 100).toFixed(2) 
          : 0
      },
      strategyStats,
      recentSignals
    };
  }
}
