from pydantic import BaseModel, Field,validator
import uuid

class User(BaseModel):
    _id: str = Field(default_factory = uuid.uuid4, alias="_id")
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None
    password: str
    
# class UserInDB(User):
#     hashed_password: str