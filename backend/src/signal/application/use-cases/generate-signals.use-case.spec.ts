import { Test, TestingModule } from '@nestjs/testing';
import { GenerateSignalsUseCase } from './generate-signals.use-case';
import { ISignalRepository } from '../../domain/repositories/signal.repository.interface';
import { IBroadcastService } from '../../domain/services/broadcast.service.interface';
import { GetPredictionUseCase } from '../../../prediction/application/use-cases/get-prediction.use-case';

describe('GenerateSignalsUseCase', () => {
  let useCase: GenerateSignalsUseCase;

  const mockSignalRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockBroadcastService = {
    broadcastSignal: jest.fn(),
  };

  const mockGetPredictionUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateSignalsUseCase,
        { provide: ISignalRepository, useValue: mockSignalRepository },
        { provide: IBroadcastService, useValue: mockBroadcastService },
        { provide: GetPredictionUseCase, useValue: mockGetPredictionUseCase },
      ],
    }).compile();

    useCase = module.get<GenerateSignalsUseCase>(GenerateSignalsUseCase);
  });

  it('VN_EXTREME_RSI should signal BUY when RSI < 25 and Volume is high', () => {
    const indicators = { rsi: 20, volume_ratio: 2.0 };
    const result = useCase.checkOverboughtOversold('VCB', 100000, indicators);
    expect(result.type).toBe('BUY');
    expect(result.strategy).toBe('VN_EXTREME_RSI');
  });

  it('OPTIMIZED_BOUNCE should signal BUY when indicators align and AI predicts growth', () => {
    const indicators = { rsi: 35, macd: 5, macd_signal: 1, volume_ratio: 1.5 };
    const result = useCase.checkTechnicalBounce(
      'VCB',
      100000,
      105000,
      indicators,
    );
    expect(result.type).toBe('BUY');
    expect(result.strategy).toBe('OPTIMIZED_BOUNCE');
  });

  it('SMART_BB_BREAKOUT should HOLD if volume is not sufficient (Anti-trap)', () => {
    const indicators = { bb_upper: 100, volume_ratio: 1.1 };
    const result = useCase.checkBbBreakout('VCB', 105, indicators);
    expect(result.type).toBe('HOLD');
  });

  it('TREND_CONFIRMATION should signal BUY on Golden Cross', () => {
    const indicators = { ema12: 100, ema26: 90, sma20: 100, sma50: 80 };
    const result = useCase.checkMaCrossover('VCB', 100, indicators);
    expect(result.type).toBe('BUY');
  });
});
