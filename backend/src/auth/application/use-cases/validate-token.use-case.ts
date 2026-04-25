import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ITokenService } from '../../domain/services/token.service.interface';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject(ITokenService)
    private readonly tokenService: ITokenService,
  ) {}

  execute(token: string) {
    try {
      return this.tokenService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
