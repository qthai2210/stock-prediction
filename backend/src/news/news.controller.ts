import { Controller, Get, Param } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) { }

    @Get(':symbol')
    async getNews(@Param('symbol') symbol: string) {
        return this.newsService.getNewsSentiment(symbol);
    }
}
