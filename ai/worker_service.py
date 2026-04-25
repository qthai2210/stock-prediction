import redis
import json
import time
import sys
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from predict import get_prediction_data

# Configuration from environment variables
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
CONCURRENCY = int(os.getenv('AI_WORKER_CONCURRENCY', 4))

def process_task(r, task):
    jobId = task.get('jobId')
    symbol = task.get('symbol', 'VCB')
    
    print(f"📥 [Process] Task {jobId} for symbol {symbol}")
    
    try:
        # Get prediction (this might involve training if not found)
        result = get_prediction_data(symbol)
        
        # Check if training is required
        if result.get('status') == 'training_required':
            print(f"⚙️ Model for {symbol} not found. Triggering synchronous training in worker thread.")
            current_dir = os.path.dirname(os.path.abspath(__file__))
            training_script = os.path.join(current_dir, 'model_training_advanced.py')
            
            # Using wait() to ensure training completes if we are in this flow, 
            # or Popen to just trigger it. Since we are in a ThreadPool, we can block.
            process = subprocess.run([sys.executable, training_script, symbol], capture_output=True, text=True)
            if process.returncode == 0:
                print(f"✅ Training for {symbol} completed.")
                result = get_prediction_data(symbol) # Retry prediction after training
            else:
                print(f"❌ Training failed: {process.stderr}")
                result = {"error": f"Training failed: {process.stderr}"}
        
        # Publish result via PubSub
        channel = f'ai_result_{jobId}'
        r.publish(channel, json.dumps(result))
        print(f"📤 [Done] Task {jobId}")
    except Exception as e:
        print(f"❌ Error processing task {jobId}: {e}")
        channel = f'ai_result_{jobId}'
        r.publish(channel, json.dumps({"error": str(e)}))

def run_worker():
    print(f"🚀 Starting AI Queue Worker (Concurrency: {CONCURRENCY})...")
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        r.ping()
        print(f"✅ Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
    except Exception as e:
        print(f"❌ Could not connect to Redis: {e}")
        sys.exit(1)

    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        while True:
            try:
                task_data = r.brpop('ai_tasks', timeout=0)
                if task_data:
                    _, msg = task_data
                    task = json.loads(msg)
                    # Submit task to executor
                    executor.submit(process_task, r, task)
            except json.JSONDecodeError:
                print("❌ Invalid JSON in queue")
            except Exception as e:
                print(f"❌ Worker Loop Error: {e}")
                time.sleep(1)

if __name__ == '__main__':
    run_worker()
