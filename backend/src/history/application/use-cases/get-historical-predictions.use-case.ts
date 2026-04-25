import { Injectable, Inject } from '@nestjs/common';
import { IPredictionRepository } from '../../../prediction/domain/repositories/prediction.repository.interface';

@Injectable()
export class GetHistoricalPredictionsUseCase {
  constructor(
    @Inject(IPredictionRepository)
    private readonly predictionRepository: IPredictionRepository,
  ) {}

  async execute(symbol: string) {
    return this.predictionRepository.findManyBySymbol(symbol, 30);
  }
}
