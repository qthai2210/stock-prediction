import { Test, TestingModule } from '@nestjs/testing';
import { PredictionService } from './prediction.service';
import { GetPredictionUseCase } from './application/use-cases/get-prediction.use-case';

describe('PredictionService', () => {
  let service: PredictionService;

  const mockGetPredictionUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionService,
        { provide: GetPredictionUseCase, useValue: mockGetPredictionUseCase },
      ],
    }).compile();

    service = module.get<PredictionService>(PredictionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
