import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { INewsProvider } from './domain/services/news-provider.interface';
import { PythonNewsProvider } from './infrastructure/external/python-news-provider';
import { GetNewsSentimentUseCase } from './application/use-cases/get-news-sentiment.use-case';

import { RabbitMqModule } from '../infrastructure/rabbitmq/rabbitmq.module';

@Module({
    imports: [RabbitMqModule],
    controllers: [NewsController],
    providers: [
        NewsService,
        GetNewsSentimentUseCase,
        {
            provide: INewsProvider,
            useClass: PythonNewsProvider,
        },
    ],
    exports: [NewsService, GetNewsSentimentUseCase],
})
export class NewsModule { }
