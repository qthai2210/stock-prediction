import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { INewsProvider } from '../../domain/services/news-provider.interface';
import { NewsSentiment } from '../../domain/entities/news-sentiment.entity';

@Injectable()
export class PythonNewsProvider implements INewsProvider {
  private readonly logger = new Logger(PythonNewsProvider.name);

  async getNewsSentiment(symbol: string): Promise<NewsSentiment> {
    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.join(process.cwd(), 'src', 'worker', 'news_worker.py');
      const pythonProcess = spawn('python', [pythonScriptPath, symbol]);

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
          reject(`News analysis failed: ${errorString}`);
          return;
        }

        try {
          const jsonResult = JSON.parse(dataString);
          resolve(new NewsSentiment(
            jsonResult.symbol || symbol,
            jsonResult.sentiment_score || 0,
            jsonResult.sentiment_label || 'NEUTRAL',
            jsonResult.article_count || 0,
            jsonResult.articles || []
          ));
        } catch (error) {
          this.logger.error(`Failed to parse JSON: ${error}, Data: ${dataString}`);
          reject('Failed to parse news results');
        }
      });
    });
  }
}
