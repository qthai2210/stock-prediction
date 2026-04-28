import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IPositionRepository } from '../../domain/repositories/position.repository.interface';
import { IUserRepository } from '../../../auth/domain/repositories/user.repository.interface';
import {
  Order,
  OrderStatus,
  OrderSide,
  OrderType,
} from '../../domain/entities/order.entity';
import { Position } from '../../domain/entities/position.entity';
import { PrismaService } from '../../../prisma/prisma.service';

export interface PlaceOrderInput {
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;
  price: number;
  stopPrice?: number;
  userId: number;
}

@Injectable()
export class PlaceOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPositionRepository)
    private readonly positionRepository: IPositionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: PlaceOrderInput): Promise<Order> {
    this.validate(input);

    return await this.prisma.$transaction(async (tx) => {
      const user = await this.userRepository.findById(input.userId);
      if (!user) throw new NotFoundException('User not found');

      // Create Order instance to determine initial status
      const orderData = Order.create({
        symbol: input.symbol,
        type: input.type as OrderSide,
        orderType: input.orderType as OrderType,
        quantity: input.quantity,
        price: input.price,
        stopPrice: input.stopPrice,
        userId: input.userId,
      });

      const isFilled = orderData.status === OrderStatus.FILLED;

      if (isFilled) {
        const totalCost = input.quantity * input.price;

        if (input.type === 'BUY') {
          if (user.balance < totalCost) {
            throw new BadRequestException(
              'Insufficient balance for this trade',
            );
          }

          // Update User Balance
          await this.userRepository.save(
            {
              ...user,
              balance: user.balance - totalCost,
            },
            tx,
          );

          // Update Position
          const existingPos = await this.positionRepository.findByUserAndSymbol(
            input.userId,
            input.symbol,
          );
          if (existingPos) {
            const newQuantity = existingPos.quantity + input.quantity;
            const newAvgPrice =
              (existingPos.avgPrice * existingPos.quantity + totalCost) /
              newQuantity;
            await this.positionRepository.save(
              new Position(
                existingPos.id,
                input.symbol,
                newQuantity,
                newAvgPrice,
                input.userId,
              ),
              tx,
            );
          } else {
            await this.positionRepository.save(
              Position.create({
                symbol: input.symbol,
                quantity: input.quantity,
                avgPrice: input.price,
                userId: input.userId,
              }),
              tx,
            );
          }
        } else {
          // SELL Logic
          const existingPos = await this.positionRepository.findByUserAndSymbol(
            input.userId,
            input.symbol,
          );
          if (!existingPos || existingPos.quantity < input.quantity) {
            throw new BadRequestException(
              'Insufficient stock quantity to sell',
            );
          }

          // Update User Balance
          await this.userRepository.save(
            {
              ...user,
              balance: (user.balance || 0) + totalCost,
            },
            tx,
          );

          // Update Position
          const newQuantity = existingPos.quantity - input.quantity;
          if (newQuantity === 0) {
            await this.positionRepository.delete(
              input.userId,
              input.symbol,
              tx,
            );
          } else {
            await this.positionRepository.save(
              new Position(
                existingPos.id,
                input.symbol,
                newQuantity,
                existingPos.avgPrice,
                input.userId,
              ),
              tx,
            );
          }
        }
      }

      return await this.orderRepository.save(orderData, tx);
    });
  }

  private validate(input: PlaceOrderInput) {
    if (!input.symbol?.trim())
      throw new BadRequestException('Symbol is required');
    if (input.quantity <= 0)
      throw new BadRequestException('Quantity must be positive');
    if (!input.price || input.price <= 0)
      throw new BadRequestException(
        'Valid price is required for paper trading',
      );
  }
}
