from pydantic import BaseModel, Field, validator
from datetime import datetime,timezone
import uuid



class File(BaseModel):
    _id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    filename: str
    data: list
    added_by: str 
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))