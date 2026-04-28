export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ITokenService {
  sign(payload: any): string;
  verify(token: string): JwtPayload;
}

export const ITokenService = Symbol('ITokenService');
