from pydantic import BaseModel, Field, validator
from datetime import datetime, timezone
import uuid

class UserCreate(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None
    password: str

class User(UserCreate):
    _id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @validator('updated_at', pre=True, always=True)
    def set_updated_at(cls, v):
        return v or datetime.now(timezone.utc)

    # class Config:
    #     allow_population_by_field_name = True
