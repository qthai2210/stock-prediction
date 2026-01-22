import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PredictionModule } from './prediction/prediction.module';
import { NewsModule } from './news/news.module';
import { MarketModule } from './market/market.module';

@Module({
  imports: [PredictionModule, NewsModule, MarketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
