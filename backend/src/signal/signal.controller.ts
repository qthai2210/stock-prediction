import { Controller, Get } from '@nestjs/common';
import { SignalService } from './signal.service';

@Controller('signals')
export class SignalController {
  constructor(private readonly signalService: SignalService) {}

  @Get('stats')
  async getStats() {
    return this.signalService.getSignalStats();
  }

  @Get('history')
  async getHistory() {
    // Proxy to get signals from DB if needed specifically
    return this.signalService.getSignalStats(); // Reuse stats for now as it contains recent signals
  }
}
