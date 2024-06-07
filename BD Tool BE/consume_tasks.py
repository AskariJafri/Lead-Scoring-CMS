import json
import pika
from ScoringFunctions.functions import score_leads,send_processed_to_queue


rabbitmq_connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
task_queue_channel = rabbitmq_connection.channel()
task_queue_channel.queue_declare(queue="tasks")

processed_queue_channel = rabbitmq_connection.channel()
processed_queue_channel.queue_declare(queue="processed_tasks")

def callback(ch, method, properties, body):
    if body:
        data = json.loads(body)
        s=score_leads(data)
        send_processed_to_queue(s)
        # consume_processed_tasks(s)
        print(f"Scored: batch")

        ch.basic_ack(delivery_tag=method.delivery_tag)



def consume():
    task_queue_channel.basic_consume(
        queue="tasks", on_message_callback=callback, auto_ack=False
    )
    print("Waiting for messages. To exit press CTRL+C")
    task_queue_channel.start_consuming()




if __name__ == "__main__":
    consume()
