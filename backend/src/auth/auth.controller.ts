import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

interface RegisterDto {
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Body: { email: string, password: string }
   * Returns: { user, access_token }
   */
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  /**
   * POST /auth/login
   * Body: { email: string, password: string }
   * Returns: { user, access_token }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
