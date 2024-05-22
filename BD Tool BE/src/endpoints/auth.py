from fastapi import HTTPException,Request,APIRouter
from typing import Annotated
from fastapi import Depends
from fastapi.security import  OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from src.rules import user
from jose import JWTError, jwt
from datetime import datetime, timedelta
from src.utils import verify
from bson import ObjectId 
from dotenv import dotenv_values
config = dotenv_values(".env")
# from src.models.user import UserInDB

# def fake_decode_token(token):
#     user = get_user(fake_users_db, token)
#     return user
algorithm=config["ALGORITHM"]
secret_key=config["SECRET_KEY"]

router = APIRouter(prefix="/auth",tags=["Authentication"])


ACCESS_TOKEN_EXPIRE_MINUTES = 30
def create_access_token(data: dict):
    # Make a copy of the data dictionary
    to_encode = data.copy()

    # Check if the '_id' field exists in the data
    if '_id' in to_encode:
        # Convert the ObjectId to a string before encoding
        to_encode['_id'] = str(to_encode['_id'])

    # Calculate the token expiration time
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add the expiration time to the data dictionary
    to_encode.update({"exp": expire})

    # Encode the data into a JWT
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)

    return encoded_jwt

@router.post("/token")
async def login(request:Request,form_data: dict):
    user_dict = user.find_user_from_username(request,form_data["username"])
    password = (form_data["password"])
    print(user_dict,password)
    if not password == user_dict["password"]:
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {"access_token": create_access_token(user_dict), "token_type": "bearer"}