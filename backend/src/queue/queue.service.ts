import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private redisMain: Redis;
  private redisSub: Redis;
  private pendingRequests = new Map<
    string,
    {
      resolve: (val: unknown) => void;
      reject: (err: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  onModuleInit() {
    this.redisMain = new Redis({ host: 'localhost', port: 6379 });
    this.redisSub = new Redis({ host: 'localhost', port: 6379 });

    void this.redisSub.psubscribe('ai_result_*', (err, count) => {
      if (err) {
        this.logger.error('Failed to subscribe to AI results', err);
      } else {
        this.logger.log(
          `Subscribed to AI results channel pattern. Count: ${String(count)}`,
        );
      }
    });

    this.redisSub.on('pmessage', (pattern, channel, message) => {
      const jobId = channel.replace('ai_result_', '');
      const req = this.pendingRequests.get(jobId);
      if (req) {
        try {
          const result = JSON.parse(message) as unknown;
          req.resolve(result);
        } catch {
          req.reject(new Error('Failed to parse Python result'));
        } finally {
          clearTimeout(req.timeout);
          this.pendingRequests.delete(jobId);
        }
      }
    });
  }

  onModuleDestroy() {
    this.redisMain.disconnect();
    this.redisSub.disconnect();
  }

  async dispatchPredictionJob(symbol: string): Promise<unknown> {
    const jobId = randomUUID();

    return new Promise<unknown>((resolve, reject) => {
      // 30 second timeout for Python service
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(jobId)) {
          this.pendingRequests.delete(jobId);
          reject(
            new Error(
              'AI Prediction Timeout - Python worker may be down or busy',
            ),
          );
        }
      }, 30000);

      this.pendingRequests.set(jobId, { resolve, reject, timeout });

      const task = {
        jobId,
        type: 'predict',
        symbol,
      };

      // Push to Redis List
      this.redisMain
        .lpush('ai_tasks', JSON.stringify(task))
        .catch((err: unknown) => {
          clearTimeout(timeout);
          this.pendingRequests.delete(jobId);
          reject(err instanceof Error ? err : new Error(String(err)));
        });
    });
  }
}
