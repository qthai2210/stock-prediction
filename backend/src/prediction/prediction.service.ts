import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class PredictionService {
    async predict(symbol: string): Promise<any> {
        // Use 'python3' command for Linux/Docker environment
        // Fallback to local python venv if needed during dev (but 'python' is safer if in path)
        const pythonCommand = process.platform === 'win32'
            ? path.join(process.cwd(), '../venv/Scripts/python.exe')
            : 'python3';

        const workerPath = path.join(process.cwd(), 'src/worker/worker.py');

        return new Promise((resolve, reject) => {
            const pythonProcess = spawn(pythonCommand, [workerPath, symbol]);

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

                    // Handle Training Required Signal
                    if (parsedResult.status === 'training_required') {
                        const symbol = parsedResult.symbol;
                        // Spawn background training process (detached)
                        const trainingScript = path.join(process.cwd(), '../ai/model_training_advanced.py');

                        // Use the same python executable logic (or just 'python' for docker/path)
                        const trainingProcess = spawn(pythonCommand, [trainingScript, symbol], {
                            detached: true,
                            stdio: 'ignore'
                        });

                        trainingProcess.unref(); // Allow parent to exit independently

                        resolve({
                            status: 'processing',
                            message: `Training model for ${symbol} in background. Please poll for updates.`
                        });
                        return;
                    }

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
