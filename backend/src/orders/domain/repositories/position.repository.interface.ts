import { Position } from '../entities/position.entity';

export interface IPositionRepository {
  findByUserId(userId: number): Promise<Position[]>;
  findByUserAndSymbol(userId: number, symbol: string): Promise<Position | null>;
  save(position: Position): Promise<Position>;
  delete(userId: number, symbol: string): Promise<void>;
}

export const IPositionRepository = Symbol('IPositionRepository');
