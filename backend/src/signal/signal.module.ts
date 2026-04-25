import { Module } from '@nestjs/common';
import { SignalService } from './signal.service';
import { SignalController } from './signal.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { PredictionModule } from '../prediction/prediction.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ISignalRepository } from './domain/repositories/signal.repository.interface';
import { PrismaSignalRepository } from './infrastructure/persistence/prisma-signal.repository';
import { IBroadcastService } from './domain/services/broadcast.service.interface';
import { WebsocketBroadcastService } from './infrastructure/messaging/websocket-broadcast.service';
import { GenerateSignalsUseCase } from './application/use-cases/generate-signals.use-case';
import { EvaluateSignalAccuracyUseCase } from './application/use-cases/evaluate-signal-accuracy.use-case';
import { GetSignalStatsUseCase } from './application/use-cases/get-signal-stats.use-case';

@Module({
  imports: [GatewayModule, PredictionModule, PrismaModule],
  controllers: [SignalController],
  providers: [
    SignalService,
    GenerateSignalsUseCase,
    EvaluateSignalAccuracyUseCase,
    GetSignalStatsUseCase,
    {
      provide: ISignalRepository,
      useClass: PrismaSignalRepository,
    },
    {
      provide: IBroadcastService,
      useClass: WebsocketBroadcastService,
    },
  ],
  exports: [SignalService],
})
export class SignalModule {}
