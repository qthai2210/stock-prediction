export interface ITokenService {
  sign(payload: any): string;
  verify<T>(token: string): T;
}

export const ITokenService = Symbol('ITokenService');
