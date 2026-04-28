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

  it('should return prediction data when completed', async () => {
    const mockResult = { symbol: 'AAPL', prediction: 150, status: 'completed' };
    mockGetPredictionUseCase.execute.mockResolvedValue(mockResult);

    const result = await service.predict('AAPL');
    expect(result).toEqual(mockResult);
    expect(mockGetPredictionUseCase.execute).toHaveBeenCalledWith('AAPL');
  });

  it('should return processing status when training is required', async () => {
    const mockResult = { status: 'processing', message: 'Training...' };
    mockGetPredictionUseCase.execute.mockResolvedValue(mockResult);

    const result = await service.predict('AAPL');
    expect(result.status).toBe('processing');
    expect(result.message).toBeDefined();
  });
});
