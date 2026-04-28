import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PredictionModule } from './prediction/prediction.module';
import { NewsModule } from './news/news.module';
import { MarketModule } from './market/market.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GatewayModule } from './gateway/gateway.module';
import { SignalModule } from './signal/signal.module';
import { QueueModule } from './queue/queue.module';
import { PrismaModule } from './prisma/prisma.module';
import { HistoryModule } from './history/history.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { BffModule } from './bff/bff.module';

@Module({
  imports: [
    // ─── Core Infrastructure ──────────────────────────────────
    PrismaModule,
    ScheduleModule.forRoot(),
    QueueModule,

    // ─── Rate Limiting (Redis-ready, in-memory fallback) ─────
    // Two throttler tiers:
    //   "global"  → 100 req/min for all routes
    //   "orders"  → 5 req/sec for /orders/place & /bff/orders/place
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'global', ttl: 60_000, limit: 100 },
        { name: 'orders', ttl: 1_000, limit: 5 },
      ],
    }),

    // ─── Feature Modules ──────────────────────────────────────
    HistoryModule,
    PredictionModule,
    NewsModule,
    MarketModule,
    GatewayModule,
    SignalModule,

    // ─── Gateway Layer ────────────────────────────────────────
    AuthModule,
    OrdersModule,
    BffModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply ThrottlerGuard globally — all routes are rate-limited
    // unless overridden with @SkipThrottle()
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
