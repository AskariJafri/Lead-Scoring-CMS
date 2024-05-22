from pydantic import BaseModel, Field,validator
import uuid

class File(BaseModel):
    _id: str = Field(default_factory = uuid.uuid4, alias="_id")
    filename: str
    data: list
    
# class UserInDB(User):
#     hashed_password: str