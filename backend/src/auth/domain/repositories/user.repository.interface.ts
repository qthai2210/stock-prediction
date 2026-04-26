import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  save(user: Partial<User>, tx?: any): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
