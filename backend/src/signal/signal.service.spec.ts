import { Test, TestingModule } from '@nestjs/testing';
import { SignalService } from './signal.service';
import { GenerateSignalsUseCase } from './application/use-cases/generate-signals.use-case';
import { EvaluateSignalAccuracyUseCase } from './application/use-cases/evaluate-signal-accuracy.use-case';
import { GetSignalStatsUseCase } from './application/use-cases/get-signal-stats.use-case';

describe('SignalService', () => {
  let service: SignalService;

  const mockGenerateSignalsUseCase = { execute: jest.fn() };
  const mockEvaluateSignalAccuracyUseCase = { execute: jest.fn() };
  const mockGetSignalStatsUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalService,
        {
          provide: GenerateSignalsUseCase,
          useValue: mockGenerateSignalsUseCase,
        },
        {
          provide: EvaluateSignalAccuracyUseCase,
          useValue: mockEvaluateSignalAccuracyUseCase,
        },
        { provide: GetSignalStatsUseCase, useValue: mockGetSignalStatsUseCase },
      ],
    }).compile();

    service = module.get<SignalService>(SignalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generateSignals should call GenerateSignalsUseCase', async () => {
    await service.generateSignals();
    expect(mockGenerateSignalsUseCase.execute).toHaveBeenCalled();
  });

  it('validateSignalAccuracy should call EvaluateSignalAccuracyUseCase', async () => {
    await service.validateSignalAccuracy();
    expect(mockEvaluateSignalAccuracyUseCase.execute).toHaveBeenCalled();
  });

  it('getSignalStats should call GetSignalStatsUseCase', async () => {
    await service.getSignalStats();
    expect(mockGetSignalStatsUseCase.execute).toHaveBeenCalled();
  });
});
