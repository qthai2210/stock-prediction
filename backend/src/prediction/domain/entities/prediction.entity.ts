export enum PredictionStatus {
  COMPLETED = 'completed',
  PROCESSING = 'processing',
  FAILED = 'failed',
  TRAINING_REQUIRED = 'training_required',
}

export class Prediction {
  constructor(
    public readonly id: number,
    public readonly symbol: string,
    public readonly currentPrice: number,
    public readonly predictedPrice: number,
    public readonly changePercent: number,
    public readonly rsi: number,
    public readonly macd: number,
    public readonly createdAt: Date,
  ) {}
}

export interface PredictionResult {
  symbol: string;
  prediction?: number;
  latest_close?: number;
  change_pct?: number;
  indicators?: {
    rsi: number;
    macd: number;
  };
  cached: boolean;
  status?: PredictionStatus;
  message?: string;
  error?: string;
}
