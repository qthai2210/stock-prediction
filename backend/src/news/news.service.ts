import { Injectable } from '@nestjs/common';
import { GetNewsSentimentUseCase } from './application/use-cases/get-news-sentiment.use-case';

@Injectable()
export class NewsService {
    constructor(
        private readonly getNewsSentimentUseCase: GetNewsSentimentUseCase,
    ) {}

    async getNewsSentiment(symbol: string): Promise<any> {
        return this.getNewsSentimentUseCase.execute(symbol);
    }
}
