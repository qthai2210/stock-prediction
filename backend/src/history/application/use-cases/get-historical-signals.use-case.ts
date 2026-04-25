import { Injectable, Inject } from '@nestjs/common';
import { ISignalRepository } from '../../../signal/domain/repositories/signal.repository.interface';

@Injectable()
export class GetHistoricalSignalsUseCase {
  constructor(
    @Inject(ISignalRepository)
    private readonly signalRepository: ISignalRepository,
  ) {}

  async execute(symbol: string) {
    return this.signalRepository.findBySymbol(symbol, 50);
  }
}
