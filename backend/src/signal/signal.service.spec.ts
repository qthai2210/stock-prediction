import { Test, TestingModule } from '@nestjs/testing';
import { SignalService } from './signal.service';
import { TradingGateway } from '../gateway/trading.gateway';
import { PredictionService } from '../prediction/prediction.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SignalService Logic Test', () => {
  let service: SignalService;

  const mockGateway = { broadcastSignal: jest.fn() };
  const mockPredictionService = { predict: jest.fn() };
  const mockPrisma = { signal: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalService,
        { provide: TradingGateway, useValue: mockGateway },
        { provide: PredictionService, useValue: mockPredictionService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SignalService>(SignalService);
  });

  it('VN_EXTREME_RSI should signal BUY when RSI < 25 and Volume is high', () => {
    const indicators = { rsi: 20, volume_ratio: 2.0 };
    const result = (service as any).checkOverboughtOversold('VCB', 100000, indicators);
    expect(result.type).toBe('BUY');
    expect(result.strategy).toBe('VN_EXTREME_RSI');
  });

  it('OPTIMIZED_BOUNCE should signal BUY when indicators align and AI predicts growth', () => {
    const indicators = { rsi: 35, macd: 5, macd_signal: 1, volume_ratio: 1.5 };
    const result = (service as any).checkTechnicalBounce('VCB', 100000, 105000, indicators);
    expect(result.type).toBe('BUY');
    expect(result.strategy).toBe('OPTIMIZED_BOUNCE');
  });

  it('SMART_BB_BREAKOUT should HOLD if volume is not sufficient (Anti-trap)', () => {
    const indicators = { bb_upper: 100, volume_ratio: 1.1 };
    const result = (service as any).checkBbBreakout('VCB', 105, indicators);
    expect(result.type).toBe('HOLD');
  });

  it('TREND_CONFIRMATION should signal BUY on Golden Cross', () => {
    const indicators = { ema12: 100, ema26: 90, sma20: 100, sma50: 80 };
    const result = (service as any).checkMaCrossover('VCB', 100, indicators);
    expect(result.type).toBe('BUY');
  });
});
