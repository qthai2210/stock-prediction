import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPositionRepository } from '../../domain/repositories/position.repository.interface';
import { IUserRepository } from '../../../auth/domain/repositories/user.repository.interface';

@Injectable()
export class GetPortfolioUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPositionRepository)
    private readonly positionRepository: IPositionRepository,
  ) {}

  async execute(userId: number): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const positions = await this.positionRepository.findByUserId(userId);
    
    // In a real app, we would fetch current prices here to calculate total value and unrealized P/L
    // For now, we return the balance and positions
    
    return {
      balance: user.balance,
      positions: positions.map(p => ({
        symbol: p.symbol,
        quantity: p.quantity,
        avgPrice: p.avgPrice,
        totalCost: p.quantity * p.avgPrice,
      })),
      totalInitialValue: positions.reduce((acc, p) => acc + (p.quantity * p.avgPrice), 0) + (user.balance || 0),
    };
  }
}
