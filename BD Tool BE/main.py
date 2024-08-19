from fastapi import FastAPI, HTTPException
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status,WebSocket,WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import  OAuth2PasswordRequestForm
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
# from starlette.middleware.proxy_headers import ProxyHeadersMiddleware
import uvicorn
import itertools
import pika
import json
from typing import List
import aio_pika
from jose import  jwt

# from AuthFunctions.functions import User, get_current_active_user
from PreprocessingFunctions.functions import map_company_size
from ScoringFunctions.functions import score_leads, send_to_queue
from dotenv import dotenv_values
from pymongo import MongoClient
from routes.api import router as api_router
config = dotenv_values(".env")

app = FastAPI()
websocket_connections: dict = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST","PATCH","PUT","DELETE"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
# app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

rabbitmq_host = config.get("RABBITMQ_HOST", "localhost")
atlas_host = config.get("ATLAS_URI","localhost")

algorithm=config["ALGORITHM"]
secret_key=config["SECRET_KEY"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        # Extract user information from the payload if needed
        # user_id = payload.get("sub")
        # username = payload.get("username")
        # You can return user information if required
        return payload
    except jwt.JWTError:
        # If token verification fails, raise an HTTPException
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


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

@app.post("/score-leads")
async def score_leads_endpoint(payload: dict):
    try:
        data_json = payload["data_json"]
        icp_json = payload["icp_json"]
        scoring_weights = payload["scoring_weights"]
        print("calling scoring")
        batch_size = 100
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
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    websocket_connections[user_id] = websocket
    print(f"WebSocket connection accepted for user_id: {user_id}")
    
    try:
        connection = await connect_to_rabbitmq()
        channel = await connection.channel()
        queue = await channel.declare_queue(f"tasks")

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    data = json.loads(message.body)
                    scored_data = score_leads(data)
                    print(f"Sending data to WebSocket for user_id {user_id}: {scored_data}")
                    await websocket.send_json(scored_data)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user_id: {user_id}")
    except Exception as e:
        print(f"WebSocket connection error: {e}")
    finally:
        # Remove the websocket from the dictionary safely
        if user_id in websocket_connections:
            del websocket_connections[user_id]





app.include_router(api_router)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ws_ping_interval=None, proxy_headers=True, forwarded_allow_ips="*")
    