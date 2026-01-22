import { Test, TestingModule } from '@nestjs/testing';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';

describe('PredictionController', () => {
  let controller: PredictionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PredictionController],
      providers: [
        {
          provide: PredictionService,
          useValue: {
            getPrediction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PredictionController>(PredictionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
