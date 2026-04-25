import { Signal } from '../entities/signal.entity';

export interface IBroadcastService {
  broadcastSignal(signal: Signal & { message: string }): void;
}

export const IBroadcastService = Symbol('IBroadcastService');
