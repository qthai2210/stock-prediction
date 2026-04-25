import { Injectable, Inject, Logger } from '@nestjs/common';
import { ISignalRepository } from '../../../signal/domain/repositories/signal.repository.interface';
import { IPredictionRepository } from '../../../prediction/domain/repositories/prediction.repository.interface';

@Injectable()
export class GetSignalPanelUseCase {
  private readonly logger = new Logger(GetSignalPanelUseCase.name);

  constructor(
    @Inject(ISignalRepository)
    private readonly signalRepository: ISignalRepository,
    @Inject(IPredictionRepository)
    private readonly predictionRepository: IPredictionRepository,
  ) {}

  async execute(symbol: string) {
    this.logger.log(`BFF UseCase: Aggregating signal panel for ${symbol}`);

    const [signals, predictions] = await Promise.all([
      this.signalRepository.findBySymbol(symbol, 10),
      this.predictionRepository.findManyBySymbol(symbol, 20),
    ]);

    return {
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      signals,
      predictions,
    };
  }
}
