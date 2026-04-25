import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './jwt.guard';

/**
 * @Public() — mark a route/controller as publicly accessible (no JWT required)
 * Usage:
 *   @Public()
 *   @Get('health')
 *   healthCheck() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * @CurrentUser() — inject the decoded JWT payload into a parameter
 * Usage:
 *   async myRoute(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
