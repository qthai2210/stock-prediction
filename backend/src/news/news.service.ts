import { Injectable } from '@nestjs/common';
import { GetNewsSentimentUseCase } from './application/use-cases/get-news-sentiment.use-case';
import { NewsSentiment } from './domain/entities/news-sentiment.entity';

@Injectable()
export class NewsService {
  constructor(
    private readonly getNewsSentimentUseCase: GetNewsSentimentUseCase,
  ) {}

  async getNewsSentiment(symbol: string): Promise<NewsSentiment> {
    return this.getNewsSentimentUseCase.execute(symbol);
  }
}
