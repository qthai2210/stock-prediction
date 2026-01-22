import { Controller, Get, Param } from '@nestjs/common';
import { PredictionService } from './prediction.service';

@Controller('prediction')
export class PredictionController {
    constructor(private readonly predictionService: PredictionService) { }

    @Get(':symbol')
    async getPrediction(@Param('symbol') symbol: string) {
        return this.predictionService.predict(symbol);
    }
}
