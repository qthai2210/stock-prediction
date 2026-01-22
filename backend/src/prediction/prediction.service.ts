import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class PredictionService {
    async predict(symbol: string): Promise<any> {
        const pythonExecutable = path.join(process.cwd(), '../venv/Scripts/python.exe');
        const workerPath = path.join(process.cwd(), 'src/worker/worker.py');

        return new Promise((resolve, reject) => {
            const pythonProcess = spawn(pythonExecutable, [workerPath, symbol]);

            let result = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                result += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new InternalServerErrorException(`Python process failed: ${error}`));
                    return;
                }

                try {
                    const parsedResult = JSON.parse(result);
                    if (parsedResult.error) {
                        reject(new InternalServerErrorException(parsedResult.error));
                    } else if (parsedResult.statusCode === 500) {
                        reject(new InternalServerErrorException(parsedResult.error || "Unknown Python Error"));
                    } else {
                        resolve(parsedResult);
                    }
                } catch (e) {
                    reject(new InternalServerErrorException(`Failed to parse result: ${result}`));
                }
            });
        });
    }
}
