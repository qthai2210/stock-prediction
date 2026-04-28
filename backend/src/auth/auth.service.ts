import { Injectable } from '@nestjs/common';
import {
  RegisterUseCase,
  RegisterInput,
} from './application/use-cases/register.use-case';
import {
  LoginUseCase,
  LoginInput,
} from './application/use-cases/login.use-case';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';
import { JwtPayload } from './domain/services/token.service.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {}

  async register(dto: RegisterInput) {
    return this.registerUseCase.execute(dto);
  }

  async login(dto: LoginInput) {
    return this.loginUseCase.execute(dto);
  }

  validateToken(token: string): JwtPayload {
    return this.validateTokenUseCase.execute(token);
  }
}
