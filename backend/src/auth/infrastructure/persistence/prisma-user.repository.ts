import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User, UserRole } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { email } });
    return prismaUser ? this.mapToEntity(prismaUser) : null;
  }

  async findById(id: number): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    return prismaUser ? this.mapToEntity(prismaUser) : null;
  }

  async save(data: Partial<User> & { passwordHash: string }, tx?: any): Promise<User> {
    const client = tx || this.prisma;
    const prismaUser = await (client as any).user.upsert({
      where: { email: data.email },
      update: {
        passwordHash: data.passwordHash,
        role: data.role,
        balance: data.balance,
      },
      create: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        balance: data.balance ?? 100000000,
      },
    });
    return this.mapToEntity(prismaUser);
  }

  private mapToEntity(prismaUser: { id: number; email: string; role: string; createdAt: Date; balance: number; passwordHash?: string }): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.role as UserRole,
      prismaUser.createdAt,
      Number(prismaUser.balance),
      prismaUser.passwordHash,
    );
  }
}
