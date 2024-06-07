import pandas as pd
from sentence_transformers import SentenceTransformer, util
from sklearn.preprocessing import MinMaxScaler
from concurrent.futures import ThreadPoolExecutor, as_completed
from PreprocessingFunctions.functions import preprocess_field,map_company_size
import time
import pika
import json
from dotenv import dotenv_values



model = SentenceTransformer('all-mpnet-base-v2')
config = dotenv_values(".env")

rabbitmq_host = config.get("RABBITMQ_HOST", "localhost")


def callback(ch, method, properties, body):
    if body:
        data = json.loads(body)
        s=score_leads(data)
        send_processed_to_queue(s)
        # consume_processed_tasks(s)
        print(f"Scored: batch")

        ch.basic_ack(delivery_tag=method.delivery_tag)
def send_to_queue(payload):
    """Sends the payload to the RabbitMQ queue."""
    connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
    channel = connection.channel()
    channel.queue_declare(queue="tasks")
    channel.basic_publish(
        exchange="", routing_key="tasks", body=json.dumps(payload), 
    )
    connection.close()

def send_processed_to_queue(payload):
    """Sends the payload to the RabbitMQ queue."""
    print("sending processed task")
    connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
    channel = connection.channel()
    channel.queue_declare(queue="processed_tasks")
    channel.basic_publish(
        exchange="", routing_key="processed_tasks", body=json.dumps(payload)
    )
    connection.close()

# Function to get SBERT embeddings
def get_sbert_embedding(text, model):
    return model.encode(text, convert_to_tensor=True)

# Function to preprocess data and get embeddings
def preprocess_and_embed(row, columns, model):
    for col in columns:
        row[col] = preprocess_field(row[col], col)
        row[col + '_embedding'] = get_sbert_embedding(row[col], model)
    return row

# Function to calculate scores for each row
def calculate_scores(row, icp_embeddings, scoring_weights):
    total_score = 0
    column_scores = {}

    for col, weight in scoring_weights.items():
        try:
            similarity = util.cos_sim(row[col + '_embedding'], icp_embeddings[col]).item()
            score = round(similarity * 100 * weight, 2)  # Scale similarity score to 100 and apply weight
            total_score += score
            column_scores[col] = score
        except Exception as e:
            print(f"Error calculating score for row, column {col}: {e}")
            continue  # Skip this column if there's an error

    row['total_score'] = round(total_score, 2)
    for col in scoring_weights:
        row[f'{col}_score'] = column_scores.get(col, 0)
    return row

def score_leads(payload):
    try:
        start_time = time.time()
        print("In Scoring Function")
        data_json = payload["data_json"]
        icp_json = payload["icp_json"]
        scoring_weights = payload["scoring_weights"]

        for entry in data_json:
            if "Employees Size" in entry:
                entry["Employees Size"] = map_company_size(entry["Employees Size"])
       
        # Load data
        data = pd.DataFrame(data_json).fillna("N/A")
        icp_data = pd.DataFrame([icp_json])
        
        # Check if required columns are present
        required_columns = list(scoring_weights.keys())
        for col in required_columns:
            if col not in data.columns:
                print(f"Error: Column '{col}' not found in the input data")
                return []
            if col not in icp_data.columns:
                print(f"Error: Column '{col}' not found in the ICP data")
                return []


        # Preprocess ICP fields and get embeddings
        icp_embeddings = {col: get_sbert_embedding(icp_data[col][0], model) for col in scoring_weights}
        print("ICP Embeddings Done")
        # Process data using concurrent futures
        with ThreadPoolExecutor() as executor:
            futures = [executor.submit(preprocess_and_embed, row, required_columns, model) for index, row in data.iterrows()]
            data = pd.DataFrame([future.result() for future in as_completed(futures)])

        with ThreadPoolExecutor() as executor:
            futures = [executor.submit(calculate_scores, row, icp_embeddings, scoring_weights) for index, row in data.iterrows()]
            scored_data = pd.DataFrame([future.result() for future in as_completed(futures)])
        print("Parallel Processing Done")
        # Normalize the scores
        scaler = MinMaxScaler()
        scored_data['normalized_score'] = scaler.fit_transform(scored_data[['total_score']]) * 100
        print("Score Normalized")

        # Drop the embedding columns
        for col in required_columns:
            if col + '_embedding' in scored_data.columns:
                scored_data.drop(columns=[col + '_embedding'], inplace=True)

        # Sort and limit to top 1000 records
        sorted_data = scored_data.sort_values(by='normalized_score', ascending=False).head(1000)

        print(f"Processing time: {time.time() - start_time} seconds")

        return sorted_data.to_dict(orient='records')

    except Exception as e:
        print(f"General error: {e}")
        return []

# Example usage (replace with your actual data and scoring weights)
# data_json = [{"Company Name": "Company A", "Contact Full Name": "John Doe"}, {"Company Name": "Company B", "Contact Full Name": "Jane Smith"}]
# icp_json = {"Company Name": "Ideal Company", "Contact Full Name": "Ideal Contact"}
# scoring_weights = {"Company Name": 0.5, "Contact Full Name": 0.5}

# result = score_leads(data_json, icp_json, scoring_weights)
# print(result)
