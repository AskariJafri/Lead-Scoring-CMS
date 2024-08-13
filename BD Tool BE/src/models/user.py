from pydantic import BaseModel, Field, validator
from datetime import datetime,timezone
import uuid
class User(BaseModel):
    _id: str = Field(default_factory=uuid.uuid4, alias="_id")
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None
    password: str
    created_at: datetime = Field(default_factory=datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=datetime.now(timezone.utc))

    @validator('updated_at', pre=True, always=True)
    def set_updated_at(cls, v):
        return v or datetime.now(timezone.utc)()