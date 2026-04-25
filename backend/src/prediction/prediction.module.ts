import { Module } from '@nestjs/common';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMqModule } from '../infrastructure/rabbitmq/rabbitmq.module';
import { IPredictionRepository } from './domain/repositories/prediction.repository.interface';
import { PrismaPredictionRepository } from './infrastructure/persistence/prisma-prediction.repository';
import { IPredictionQueue } from './domain/services/prediction-queue.interface';
import { RabbitMqPredictionQueue } from './infrastructure/messaging/rabbitmq-prediction-queue';
import { GetPredictionUseCase } from './application/use-cases/get-prediction.use-case';
import { RunBacktestUseCase } from './application/use-cases/run-backtest.use-case';

@Module({
    imports: [QueueModule, PrismaModule, RabbitMqModule],
    controllers: [PredictionController],
    providers: [
        PredictionService,
        GetPredictionUseCase,
        RunBacktestUseCase,
        {
            provide: IPredictionRepository,
            useClass: PrismaPredictionRepository,
        },
        {
            provide: IPredictionQueue,
            useClass: RabbitMqPredictionQueue,
        },
    ],
    exports: [PredictionService, GetPredictionUseCase, RunBacktestUseCase],
})
export class PredictionModule { }
