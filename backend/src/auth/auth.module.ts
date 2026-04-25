import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtGuard } from './jwt.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { IUserRepository } from './domain/repositories/user.repository.interface';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { IHashService } from './domain/services/hash.service.interface';
import { BcryptHashService } from './infrastructure/services/bcrypt-hash.service';
import { ITokenService } from './domain/services/token.service.interface';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'change-me-in-production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtGuard,
    RegisterUseCase,
    LoginUseCase,
    ValidateTokenUseCase,
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: IHashService,
      useClass: BcryptHashService,
    },
    {
      provide: ITokenService,
      useClass: JwtTokenService,
    },
  ],
  exports: [AuthService, JwtGuard, ITokenService, ValidateTokenUseCase],
})
export class AuthModule {}
