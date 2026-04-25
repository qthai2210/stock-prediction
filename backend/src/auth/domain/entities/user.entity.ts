export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly balance: number,
    public readonly passwordHash?: string,
  ) {}
}
