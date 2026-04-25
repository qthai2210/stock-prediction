import { Injectable } from '@nestjs/common';
import { IBroadcastService } from '../../domain/services/broadcast.service.interface';
import { Signal } from '../../domain/entities/signal.entity';
import { TradingGateway } from '../../../gateway/trading.gateway';

@Injectable()
export class WebsocketBroadcastService implements IBroadcastService {
  constructor(private readonly gateway: TradingGateway) {}

  broadcastSignal(signal: Signal & { message: string }): void {
    this.gateway.broadcastSignal(signal);
  }
}
