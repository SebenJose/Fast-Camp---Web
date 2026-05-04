from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class Message(BaseModel):
    message: str


class UserSchema(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    username: str
    email: EmailStr
    id: int
    model_config = ConfigDict(from_attributes=True)


class UserList(BaseModel):
    users: list[UserPublic]


class Token(BaseModel):
    access_token: str
    token_type: str


class SurveySchema(BaseModel):
    readingDate: datetime
    theme: str
    frequency: str


class SurveyPublic(BaseModel):
    id: int
    readingDate: datetime
    theme: str
    frequency: str
    model_config = ConfigDict(from_attributes=True)


class SurveyList(BaseModel):
    surveys: list[SurveyPublic]
