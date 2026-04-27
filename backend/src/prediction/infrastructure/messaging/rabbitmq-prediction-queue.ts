import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IPredictionQueue } from '../../domain/services/prediction-queue.interface';
import { PredictionResult } from '../../domain/entities/prediction.entity';

@Injectable()
export class RabbitMqPredictionQueue implements IPredictionQueue {
  private readonly logger = new Logger(RabbitMqPredictionQueue.name);

  constructor(@Inject('AI_SERVICE') private readonly client: ClientProxy) {}

  async dispatchPredictionJob(symbol: string): Promise<PredictionResult> {
    this.logger.log(`Dispatching prediction job for ${symbol} via RabbitMQ`);

    try {
      // NestJS ClientProxy.send implements Request-Response pattern over AMQP
      const result = await firstValueFrom<unknown>(
        this.client.send({ cmd: 'predict' }, { symbol }),
      );

      return result as PredictionResult;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get prediction for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async dispatchBacktestJob(
    symbol: string,
    days: number = 100,
  ): Promise<unknown> {
    this.logger.log(
      `Dispatching backtest job for ${symbol} (${days} days) via RabbitMQ`,
    );

    try {
      const result = await firstValueFrom<unknown>(
        this.client.send({ cmd: 'backtest' }, { symbol, days }),
      );

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get backtest for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getSentiment(symbol: string): Promise<unknown> {
    this.logger.log(`Dispatching sentiment job for ${symbol} via RabbitMQ`);

    try {
      const result = await firstValueFrom<unknown>(
        this.client.send({ cmd: 'sentiment' }, { symbol }),
      );

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get sentiment for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
