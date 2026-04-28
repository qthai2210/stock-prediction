import { Position } from '../entities/position.entity';

export interface IPositionRepository {
  findByUserId(userId: number): Promise<Position[]>;
  findByUserAndSymbol(userId: number, symbol: string): Promise<Position | null>;
  save(position: Position, tx?: any): Promise<Position>;
  delete(userId: number, symbol: string, tx?: any): Promise<void>;
}

export const IPositionRepository = Symbol('IPositionRepository');
