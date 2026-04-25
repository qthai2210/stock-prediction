import pika
import json
import sys
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from predict import get_prediction_data

# Configuration from environment variables
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:password123@localhost:5672')
CONCURRENCY = int(os.getenv('AI_WORKER_CONCURRENCY', 4))

def process_task(ch, method, props, body):
    try:
        # NestJS Microservice message structure: { pattern: any, data: any, id: string }
        message = json.loads(body)
        pattern = message.get('pattern')
        data = message.get('data', {})
        symbol = data.get('symbol', 'VCB')
        
        print(f"📥 [Process] Received request for symbol: {symbol}")
        
        # Process logic
        result = get_prediction_data(symbol)
        
        if result.get('status') == 'training_required':
            print(f"⚙️ Training model for {symbol}...")
            current_dir = os.path.dirname(os.path.abspath(__file__))
            training_script = os.path.join(current_dir, 'model_training_advanced.py')
            process = subprocess.run([sys.executable, training_script, symbol], capture_output=True, text=True)
            if process.returncode == 0:
                result = get_prediction_data(symbol)
            else:
                result = {"error": f"Training failed: {process.stderr}"}

        # NestJS Expects Response structure: { err: any, response: any, id: string }
        response = {
            "err": None,
            "response": result,
            "id": message.get('id') # Correlation ID from NestJS
        }

        # Send response back to the reply_to queue
        ch.basic_publish(
            exchange='',
            routing_key=props.reply_to,
            properties=pika.BasicProperties(correlation_id=props.correlation_id),
            body=json.dumps(response)
        )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"📤 [Done] Sent response for {symbol}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        # Send error back if possible
        if props.reply_to:
            error_response = {"err": str(e), "response": None, "id": message.get('id') if 'message' in locals() else None}
            ch.basic_publish(exchange='', routing_key=props.reply_to, body=json.dumps(error_response))
        ch.basic_ack(delivery_tag=method.delivery_tag)

def run_worker():
    print(f"🚀 Starting RabbitMQ AI Worker (Concurrency: {CONCURRENCY})...")
    
    try:
        params = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.queue_declare(queue='ai_tasks', durable=True)
        channel.basic_qos(prefetch_count=CONCURRENCY)
        channel.basic_consume(queue='ai_tasks', on_message_callback=process_task)

        print(f"✅ Connected to RabbitMQ at {RABBITMQ_URL.split('@')[-1]}")
        print("⌛ Waiting for messages. To exit press CTRL+C")
        channel.start_consuming()
        
    except Exception as e:
        print(f"❌ RabbitMQ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_worker()
