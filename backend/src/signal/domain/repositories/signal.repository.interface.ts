import { Signal } from '../entities/signal.entity';

export interface ISignalRepository {
  save(signal: Partial<Signal>): Promise<Signal>;
  findActive(): Promise<Signal[]>;
  update(id: number, data: Partial<Signal>): Promise<Signal>;
  findAllClosed(): Promise<Signal[]>;
  findRecent(limit: number): Promise<Signal[]>;
  findBySymbol(symbol: string, limit: number): Promise<Signal[]>;
}

export const ISignalRepository = Symbol('ISignalRepository');
