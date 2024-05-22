from fastapi import Body, Request, HTTPException, status
from fastapi.encoders import jsonable_encoder
from src.models.user import User 
from bson import ObjectId
from passlib.context import CryptContext
from src import utils

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_collection_users(request:Request):
    return request.app.database["Users"]

def create_user(request: Request, user:User = Body(...)):
    user = jsonable_encoder(user)
    # print(user)
    # hashed_password = utils.hashPassword(user["password"])
    # user["password"] = hashed_password
    all_users=list(get_collection_users(request).find({"username":user["username"]}))
    usernames = [username["username"] for username in all_users]
    if user["username"] in usernames:
        raise HTTPException(status_code=status.HTTP_417_EXPECTATION_FAILED, detail=f"user with this username already exists!")
    new_user = get_collection_users(request).insert_one(user)
    created_user = get_collection_users(request).find_one({"_id":new_user.inserted_id})
    return created_user

def list_users(request: Request, limit:int):
    users = list(get_collection_users(request).find(limit= limit))
    return users

def find_user(request: Request, id:str):
    if(user := get_collection_users(request).find_one({"_id":ObjectId(id)})):
        return user
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {id} not found!")
def find_user_from_username(request: Request, username:str):
    if(user := get_collection_users(request).find_one({"username":username})):
        return user
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {id} not found!")

def delete_user(request: Request,id:str):
    deleted_user = get_collection_users(request).delete_one({"_id":ObjectId(id)})
    
    if deleted_user.deleted_count == 1:
        return f"user with id {id} deleted successfully"
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {id} not found!")

    
    