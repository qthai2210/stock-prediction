import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { IOrderRepository } from './domain/repositories/order.repository.interface';
import { IPositionRepository } from './domain/repositories/position.repository.interface';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { PrismaPositionRepository } from './infrastructure/persistence/prisma-position.repository';
import { PlaceOrderUseCase } from './application/use-cases/place-order.use-case';
import { GetPortfolioUseCase } from './application/use-cases/get-portfolio.use-case';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrdersController],
  providers: [
    PlaceOrderUseCase,
    GetPortfolioUseCase,
    {
      provide: IOrderRepository,
      useClass: PrismaOrderRepository,
    },
    {
      provide: IPositionRepository,
      useClass: PrismaPositionRepository,
    },
  ],
  exports: [
    PlaceOrderUseCase,
    GetPortfolioUseCase,
    IOrderRepository,
    IPositionRepository,
  ],
})
export class OrdersModule {}
