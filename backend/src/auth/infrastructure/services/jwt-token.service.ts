import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '../../domain/services/token.service.interface';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: any): string {
    return this.jwtService.sign(payload);
  }

  verify<T extends object>(token: string): T {
    return this.jwtService.verify<T>(token);
  }
}
