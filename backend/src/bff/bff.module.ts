import { Module } from '@nestjs/common';
import { BffController } from './bff.controller';
import { BffService } from './bff.service';
import { PredictionModule } from '../prediction/prediction.module';
import { MarketModule } from '../market/market.module';
import { NewsModule } from '../news/news.module';
import { SignalModule } from '../signal/signal.module';
import { OrdersModule } from '../orders/orders.module';
import { GetDashboardUseCase } from './application/use-cases/get-dashboard.use-case';
import { GetSignalPanelUseCase } from './application/use-cases/get-signal-panel.use-case';
import { GetPortfolioUseCase } from './application/use-cases/get-portfolio.use-case';

@Module({
  imports: [
    PredictionModule,
    MarketModule,
    NewsModule,
    SignalModule,
    OrdersModule,
  ],
  controllers: [BffController],
  providers: [
    BffService,
    GetDashboardUseCase,
    GetSignalPanelUseCase,
    GetPortfolioUseCase,
  ],
})
export class BffModule {}
