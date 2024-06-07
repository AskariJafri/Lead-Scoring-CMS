from fastapi import FastAPI, HTTPException
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status,WebSocket,WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import  OAuth2PasswordRequestForm
import uvicorn
import itertools
import pika
import json
from typing import List
import aio_pika

# from AuthFunctions.functions import User, get_current_active_user
from PreprocessingFunctions.functions import map_company_size
from ScoringFunctions.functions import score_leads, send_to_queue
from dotenv import dotenv_values
from pymongo import MongoClient
from routes.api import router as api_router
config = dotenv_values(".env")

app = FastAPI()
websocket_connections: List[WebSocket] = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST","PATCH","PUT","DELETE"],
    allow_headers=["*"],
)

rabbitmq_host = config.get("RABBITMQ_HOST", "localhost")
atlas_host = config.get("ATLAS_URI","localhost")


# rabbitmq_connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
# task_queue_channel = rabbitmq_connection.channel()
# task_queue_channel.queue_declare(queue="tasks")

# processed_queue_channel = rabbitmq_connection.channel()
# processed_queue_channel.queue_declare(queue="processed_tasks")

# def check_all_tasks_processed():
#     """Check if both task and processed_task queues are empty."""
#     task_count = task_queue_channel.queue_declare(queue="tasks").method.message_count
#     processed_count = processed_queue_channel.queue_declare(queue="processed_tasks").method.message_count
#     return task_count == 0 and processed_count == 0


# Function to notify all websocket clients
async def notify_all_clients(message: str):
    for websocket in websocket_connections:
        await websocket.send_text(message)

@app.on_event("startup")
def start():
    app.mongodb_client = MongoClient(atlas_host)
    app.database = app.mongodb_client[config["DB_NAME"]]
    print("Startup Successful !")

@app.on_event("shutdown")
def end():
    app.mongodb_client.close()

# @app.get("/users/me")
# async def read_users_me(
#     current_user: Annotated[User, Depends(get_current_active_user)],
# ):
#     return current_user


@app.post("/score-leads")
async def score_leads_endpoint(payload: dict):
    all_data=[]
    try:
        data_json = payload["data_json"]
        icp_json = payload["icp_json"]
        scoring_weights = payload["scoring_weights"]
        print("calling scoring")
        batch_size = 50
        for i in range(0, len(data_json), batch_size):
            batch = data_json[i:i + batch_size]
            payload = {
                'data_json': batch,
                'icp_json': icp_json,
                'scoring_weights': scoring_weights
            }

            send_to_queue(payload)
            print(f"Batch {i+1} sent to queue")
        return {"status":True}
        # return all_data
    except Exception as e:
        return {"error": str(e)}
    
async def connect_to_rabbitmq():
    return await aio_pika.connect_robust("amqp://guest:guest@rabbitmq/")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.append(websocket)
    print("WebSocket connection accepted")

    connection = await connect_to_rabbitmq()
    channel = await connection.channel()
    queue = await channel.declare_queue("tasks")

    try:
        print("Rabbit mq consumer connected")

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    data = json.loads(message.body)
                    print(f"Sending data to WebSocket: {data}")
                    processed_data = score_leads(data)
                    await websocket.send_json(processed_data)

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket connection error: {e}")
    finally:
        websocket_connections.remove(websocket)
        await connection.close()




app.include_router(api_router)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000,ws_ping_interval=None)
    