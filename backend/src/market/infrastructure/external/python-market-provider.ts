import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { IMarketProvider } from '../../domain/services/market-provider.interface';
import { MarketOverview } from '../../domain/entities/market-overview.entity';

@Injectable()
export class PythonMarketProvider implements IMarketProvider {
  private readonly logger = new Logger(PythonMarketProvider.name);

  async getMarketOverview(): Promise<MarketOverview> {
    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.join(process.cwd(), 'src', 'worker', 'worker.py');
      const pythonProcess = spawn('python', [pythonScriptPath, 'MARKET']);

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Python script exited with code ${code}: ${errorString}`);
          reject(`Market analysis failed: ${errorString}`);
          return;
        }

        try {
          const jsonResult = JSON.parse(dataString);
          resolve(this.mapToEntity(jsonResult));
        } catch (error) {
          this.logger.error(`Failed to parse JSON: ${error}, Data: ${dataString}`);
          reject('Failed to parse market results');
        }
      });
    });
  }

  async getLiveQuote(symbol: string): Promise<any> {
    // Implementation for fetching specific stock quote
    throw new Error('Method not implemented.');
  }

  private mapToEntity(data: any): MarketOverview {
    return new MarketOverview(
      data.vn_index || { value: 0, change: 0, changePercent: 0, volume: 0 },
      data.hnx_index || { value: 0, change: 0, changePercent: 0, volume: 0 },
      data.upcom_index || { value: 0, change: 0, changePercent: 0, volume: 0 },
      data.top_gainers || [],
      data.top_losers || [],
      new Date(),
    );
  }
}
