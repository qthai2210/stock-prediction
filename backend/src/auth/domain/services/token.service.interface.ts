export interface ITokenService {
  sign(payload: any): string;
  verify<T extends object>(token: string): T;
}

export const ITokenService = Symbol('ITokenService');
