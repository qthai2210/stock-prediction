import { Injectable, Inject } from '@nestjs/common';
import { INewsProvider } from '../../domain/services/news-provider.interface';
import { NewsSentiment } from '../../domain/entities/news-sentiment.entity';

@Injectable()
export class GetNewsSentimentUseCase {
  constructor(
    @Inject(INewsProvider)
    private readonly newsProvider: INewsProvider,
  ) {}

  async execute(symbol: string): Promise<NewsSentiment> {
    return this.newsProvider.getNewsSentiment(symbol);
  }
}
