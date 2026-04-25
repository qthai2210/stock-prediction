import { NewsSentiment } from '../entities/news-sentiment.entity';

export interface INewsProvider {
  getNewsSentiment(symbol: string): Promise<NewsSentiment>;
}

export const INewsProvider = Symbol('INewsProvider');
