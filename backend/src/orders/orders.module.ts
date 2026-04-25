import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { IOrderRepository } from './domain/repositories/order.repository.interface';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { PlaceOrderUseCase } from './application/use-cases/place-order.use-case';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PlaceOrderUseCase,
    {
      provide: IOrderRepository,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [OrdersService, PlaceOrderUseCase, IOrderRepository],
})
export class OrdersModule {}
