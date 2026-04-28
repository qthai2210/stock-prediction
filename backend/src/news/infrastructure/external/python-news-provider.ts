import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { INewsProvider } from '../../domain/services/news-provider.interface';
import { NewsSentiment } from '../../domain/entities/news-sentiment.entity';

@Injectable()
export class PythonNewsProvider implements INewsProvider {
  private readonly logger = new Logger(PythonNewsProvider.name);

  constructor(@Inject('AI_SERVICE') private readonly client: ClientProxy) {}

  async getNewsSentiment(symbol: string): Promise<NewsSentiment> {
    this.logger.log(`Fetching news sentiment for ${symbol} via RabbitMQ`);

    try {
      const result: {
        symbol?: string;
        sentiment?: number;
        headlines?: string[];
        error?: string;
      } = await firstValueFrom(
        this.client.send({ cmd: 'sentiment' }, { symbol }),
      );

      if (result && result.error) {
        throw new Error(result.error || 'Unknown error');
      }

      const sentiment = result.sentiment ?? 0;

      return new NewsSentiment(
        result.symbol || symbol,
        sentiment,
        this.getLabel(sentiment),
        result.headlines ? result.headlines.length : 0,
        result.headlines || [],
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get news sentiment for ${symbol}: ${errorMessage}`,
      );
      throw error;
    }
  }

  private getLabel(score: number): string {
    if (score >= 0.6) return 'BULLISH';
    if (score <= 0.4) return 'BEARISH';
    return 'NEUTRAL';
  }
}
