from pydantic import BaseModel, Field
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(..., example="jdoe")
    email: str = Field(..., example="jdoe@example.com")
    password: str = Field(..., example="password123")


class UserLogin(BaseModel):
    username: str = Field(..., example="jdoe")
    password: str = Field(..., example="password123")


class UserRead(BaseModel):
    id: int
    username: str
    email: str


class TrainObjectiveCreate(BaseModel):
    name: str = Field(..., example="Resumen de sentencias")
    description: str = Field(..., example="Obtener resúmenes de fallos judiciales")


class TrainObjectiveRead(TrainObjectiveCreate):
    id: int
    slug: str
    created_at: datetime
    created_by: int
    completions_count: int


class CompletionCreate(BaseModel):
    prompt: str = Field(..., example="Resumen de la siguiente sentencia: …")
    completion: str = Field(..., example="El tribunal falló a favor de …")


class CompletionRead(CompletionCreate):
    id: int
    objective_id: int
    created_at: datetime


class TrainingJobRead(BaseModel):
    id: int
    objective_id: int
    status: str
    created_at: datetime
