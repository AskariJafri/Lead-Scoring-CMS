from fastapi import FastAPI, HTTPException
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import  OAuth2PasswordRequestForm
import uvicorn

# from AuthFunctions.functions import User, get_current_active_user
from PreprocessingFunctions.functions import map_company_size
from ScoringFunctions.functions import score_leads
from dotenv import dotenv_values
from pymongo import MongoClient
from routes.api import router as api_router
config = dotenv_values(".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST","PATCH","PUT","DELETE"],
    allow_headers=["*"],
)


@app.on_event("startup")
def start():
    app.mongodb_client = MongoClient(config["ATLAS_URI"])
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
async def score_leads_endpoint(
    payload: dict,
   
):
   
    try:
        data_json = payload["data_json"]
        icp_json = payload["icp_json"]
        scoring_weights = payload["scoring_weights"]

        for entry in data_json:
            if "Employees Size" in entry:
                entry["Employees Size"] = map_company_size(entry["Employees Size"])

        scored_leads = score_leads(data_json, icp_json, scoring_weights)
        return scored_leads
    except Exception as e:
        return {"error": str(e)}
    

app.include_router(api_router)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    