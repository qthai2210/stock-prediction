import { Injectable, Logger } from '@nestjs/common';
import { GetPredictionUseCase } from '../../../prediction/application/use-cases/get-prediction.use-case';
import { GetMarketOverviewUseCase } from '../../../market/application/use-cases/get-market-overview.use-case';
import { GetNewsSentimentUseCase } from '../../../news/application/use-cases/get-news-sentiment.use-case';

const DEFAULT_SYMBOL = 'VCB';

@Injectable()
export class GetDashboardUseCase {
  private readonly logger = new Logger(GetDashboardUseCase.name);

  constructor(
    private readonly getPredictionUseCase: GetPredictionUseCase,
    private readonly getMarketOverviewUseCase: GetMarketOverviewUseCase,
    private readonly getNewsSentimentUseCase: GetNewsSentimentUseCase,
  ) {}

  async execute() {
    this.logger.log('BFF UseCase: Aggregating dashboard data...');

    const [prediction, market, news] = await Promise.allSettled([
      this.getPredictionUseCase.execute(DEFAULT_SYMBOL),
      this.getMarketOverviewUseCase.execute(),
      this.getNewsSentimentUseCase.execute(DEFAULT_SYMBOL),
    ]);

    return {
      timestamp: new Date().toISOString(),
      prediction: prediction.status === 'fulfilled' ? prediction.value : null,
      market:     market.status     === 'fulfilled' ? market.value     : null,
      news:       news.status       === 'fulfilled' ? news.value       : null,
      errors: {
        prediction: prediction.status === 'rejected' ? prediction.reason : null,
        market:     market.status     === 'rejected' ? market.reason     : null,
        news:       news.status       === 'rejected' ? news.reason       : null,
      },
    };
  }
}
