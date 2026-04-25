import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IHashService } from '../../domain/services/hash.service.interface';

@Injectable()
export class BcryptHashService implements IHashService {
  async hash(data: string): Promise<string> {
    return bcrypt.hash(data, 12);
  }

  async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
