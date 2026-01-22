import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class NewsService {
    private readonly logger = new Logger(NewsService.name);

    async getNewsSentiment(symbol: string): Promise<any> {
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
                    // Parse JSON output from Python script
                    const jsonResult = JSON.parse(dataString);
                    resolve(jsonResult);
                } catch (error) {
                    this.logger.error(`Failed to parse JSON: ${error}, Data: ${dataString}`);
                    reject('Failed to parse news results');
                }
            });
        });
    }
}
