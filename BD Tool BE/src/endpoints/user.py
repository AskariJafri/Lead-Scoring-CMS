from fastapi import APIRouter,Body, Request, status
from typing import List
from src.models.user import User,UserCreate
import src.rules.user as users

router = APIRouter(prefix="/users",tags=["Users"])

@router.post("/", response_description='Create a new user', status_code=status.HTTP_201_CREATED, response_model=User)
def create_user(request:Request, user:UserCreate=Body(...)):
    return users.create_user(request,user)

@router.get("/", response_description='List users', status_code=status.HTTP_201_CREATED, response_model=List[User])
def list_users(request:Request):
    return users.list_users(request,5)

@router.get("/{user_id}", response_description='Get a user', status_code=status.HTTP_201_CREATED, response_model=List[User])
def find_user(request:Request, user_id:str):
    return users.find_user(request,user_id)

@router.get("/{user_id}", response_description='Get a user', status_code=status.HTTP_201_CREATED, response_model=List[User])
def find_user(request:Request, user_id:str):
    return users.find_user(request,user_id)

@router.delete("/{id}", response_description='Delete a user')
def find_user(request:Request, id:str):
    return users.delete_user(request,id)
