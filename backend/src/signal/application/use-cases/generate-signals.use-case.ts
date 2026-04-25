import { Injectable, Inject, Logger } from '@nestjs/common';
import { ISignalRepository } from '../../domain/repositories/signal.repository.interface';
import { IBroadcastService } from '../../domain/services/broadcast.service.interface';
import { Signal, SignalType, SignalStatus } from '../../domain/entities/signal.entity';
import { GetPredictionUseCase } from '../../../prediction/application/use-cases/get-prediction.use-case';

@Injectable()
export class GenerateSignalsUseCase {
  private readonly logger = new Logger(GenerateSignalsUseCase.name);
  private readonly watchList = ['VCB', 'VNM', 'FPT', 'VIC', 'HPG'];

  constructor(
    @Inject(ISignalRepository)
    private readonly signalRepository: ISignalRepository,
    @Inject(IBroadcastService)
    private readonly broadcastService: IBroadcastService,
    private readonly getPredictionUseCase: GetPredictionUseCase,
  ) {}

  async execute() {
    this.logger.log('🚀 Generating multi-strategy signals...');
    
    for (const symbol of this.watchList) {
      try {
        const data = await this.getPredictionUseCase.execute(symbol);
        if (!data || !data.indicators) continue;

        const { latest_close: price, prediction, indicators, top_features } = data;
        const strategies = [
          this.checkTechnicalBounce(symbol, price, prediction, indicators),
          this.checkAiTrend(symbol, price, prediction, top_features),
          this.checkOverboughtOversold(symbol, price, indicators),
          this.checkBbBreakout(symbol, price, indicators),
          this.checkMaCrossover(symbol, price, indicators)
        ];

        for (const strategyResult of strategies) {
          if (strategyResult && strategyResult.type !== 'HOLD') {
            const signalData: Partial<Signal> = {
              symbol,
              type: strategyResult.type as SignalType,
              strategy: strategyResult.strategy,
              priceAtTime: price,
              targetPrice: (strategyResult as any).target || prediction,
              confidence: strategyResult.confidence,
              status: SignalStatus.ACTIVE
            };

            const newSignal = await this.signalRepository.save(signalData);

            this.broadcastService.broadcastSignal({
              ...newSignal,
              message: `[${strategyResult.strategy}] 🔥 ${strategyResult.type} ${symbol} @ ${price}`
            } as any);
          }
        }
      } catch (error) {
        this.logger.error(`Error generating signals for ${symbol}: ${error.message}`);
      }
    }
  }

  // --- Strategy Methods (Extracted from old service) ---
  private checkTechnicalBounce(symbol, price, prediction, indicators) {
    const { rsi, macd, macd_signal, volume_ratio } = indicators;
    let type = 'HOLD';
    const isBullish = rsi < 40 && macd > macd_signal && prediction > price && volume_ratio > 1.2;
    const isBearish = rsi > 60 && macd < macd_signal && prediction < price;
    if (isBullish) type = 'BUY';
    else if (isBearish) type = 'SELL';
    return { strategy: 'OPTIMIZED_BOUNCE', type, confidence: 80 };
  }

  private checkAiTrend(symbol, price, prediction, top_features) {
    const changePct = ((prediction - price) / price) * 100;
    let type = 'HOLD';
    const isHighConfidence = top_features && top_features.length > 0 && top_features[0].importance > 0.15;
    if (isHighConfidence && changePct > 4) type = 'BUY';
    if (isHighConfidence && changePct < -4) type = 'SELL';
    return { strategy: 'AI_HIGH_CONVICTION', type, confidence: 90 };
  }

  private checkOverboughtOversold(symbol, price, indicators) {
    const { rsi, volume_ratio } = indicators;
    let type = 'HOLD';
    if (rsi < 25 && volume_ratio > 1.5) type = 'BUY';
    if (rsi > 75 && volume_ratio > 1.5) type = 'SELL';
    return { strategy: 'VN_EXTREME_RSI', type, confidence: 70, target: type === 'BUY' ? price * 1.07 : price * 0.93 };
  }

  private checkBbBreakout(symbol, price, indicators) {
    const { bb_upper, bb_lower, volume_ratio } = indicators;
    let type = 'HOLD';
    if (price > bb_upper && volume_ratio > 1.8) type = 'BUY';
    if (price < bb_lower && volume_ratio > 1.8) type = 'SELL';
    return { strategy: 'SMART_BB_BREAKOUT', type, confidence: 75 };
  }

  private checkMaCrossover(symbol, price, indicators) {
    const { sma20, sma50, ema12, ema26 } = indicators;
    let type = 'HOLD';
    const goldenCross = ema12 > ema26 && sma20 > sma50;
    const deathCross = ema12 < ema26 && sma20 < sma50;
    if (goldenCross) type = 'BUY';
    if (deathCross) type = 'SELL';
    return { strategy: 'TREND_CONFIRMATION', type, confidence: 70 };
  }
}
