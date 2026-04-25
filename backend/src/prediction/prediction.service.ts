import { Injectable } from '@nestjs/common';
import { GetPredictionUseCase } from './application/use-cases/get-prediction.use-case';

@Injectable()
export class PredictionService {
    constructor(
        private readonly getPredictionUseCase: GetPredictionUseCase,
    ) {}

    async predict(symbol: string): Promise<any> {
        return this.getPredictionUseCase.execute(symbol);
    }
}
