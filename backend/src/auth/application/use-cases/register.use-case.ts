import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IHashService } from '../../domain/services/hash.service.interface';
import { ITokenService } from '../../domain/services/token.service.interface';
import { UserRole } from '../../domain/entities/user.entity';

export interface RegisterInput {
  email: string;
  password: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashService)
    private readonly hashService: IHashService,
    @Inject(ITokenService)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashService.hash(input.password);

    const user = await this.userRepository.save({
      email: input.email,
      passwordHash,
      role: UserRole.USER,
    });

    const token = this.tokenService.sign({ sub: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      access_token: token,
    };
  }
}
