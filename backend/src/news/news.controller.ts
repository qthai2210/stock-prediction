import { Controller, Get, Param } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsSentiment } from './domain/entities/news-sentiment.entity';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get(':symbol')
  async getNews(@Param('symbol') symbol: string): Promise<NewsSentiment> {
    return this.newsService.getNewsSentiment(symbol);
  }
}
