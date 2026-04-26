import { Test, TestingModule } from '@nestjs/testing';
import { PredictionService } from './prediction.service';
import { GetPredictionUseCase } from './application/use-cases/get-prediction.use-case';
import { RunBacktestUseCase } from './application/use-cases/run-backtest.use-case';

describe('PredictionService', () => {
  let service: PredictionService;

  const mockGetPredictionUseCase = {
    execute: jest.fn(),
  };

  const mockRunBacktestUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionService,
        { provide: GetPredictionUseCase, useValue: mockGetPredictionUseCase },
        { provide: RunBacktestUseCase, useValue: mockRunBacktestUseCase },
      ],
    }).compile();

    service = module.get<PredictionService>(PredictionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
