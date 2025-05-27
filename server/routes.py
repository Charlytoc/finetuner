import os
from fastapi import Response
from typing import List
import uuid
from datetime import datetime

import httpx
from httpx import Timeout
from fastapi import Request
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from server.utils.helpers import get_user_id
from server.utils.auth import get_access_token
from server.db.models import TrainObjective, Completion, TrainingJob, User
from server.db.core import get_db
from server.utils.schemas import (
    # UserCreate,
    UserRead,
    TrainObjectiveCreate,
    TrainObjectiveRead,
    CompletionCreate,
    CompletionRead,
    TrainingJobRead,
    UserLogin,
)

router = APIRouter(prefix="/api/v1")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# Helpers
def make_slug(name: str) -> str:
    base = name.lower().replace(" ", "-")
    return f"{base}-{uuid.uuid4().hex[:6]}"


# @router.post("/signup", response_model=UserRead, summary="Crear un nuevo usuario")
# def signup(data: UserCreate, db: Session = Depends(get_db)):
#     existing = (
#         db.query(User)
#         .filter((User.username == data.username) | (User.email == data.email))
#         .first()
#     )
#     if existing:
#         raise HTTPException(status_code=400, detail="Usuario o correo ya registrado")

#     user = User(
#         username=data.username,
#         email=data.email,
#         password_hash=get_password_hash(data.password),  # 🔐 aquí el hash
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user


@router.post("/login", response_model=UserRead, summary="Login clásico sin JWT")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return user


@router.get(
    "/train_objectives",
    response_model=List[TrainObjectiveRead],
    summary="Listar todos los objetivos de entrenamiento",
)
def list_train_objectives(db: Session = Depends(get_db)):
    objectives = db.query(TrainObjective).all()
    return [
        TrainObjectiveRead(
            id=o.id,
            name=o.name,
            slug=o.slug,
            description=o.description,
            created_at=o.created_at,
            created_by=o.created_by,
            completions_count=len(o.completions),  # 👈 cuenta las relaciones
        )
        for o in objectives
    ]


@router.post("/train_objectives", response_model=TrainObjectiveRead)
def create_train_objective(
    data: TrainObjectiveCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id),
):
    slug = make_slug(data.name)
    obj = TrainObjective(
        name=data.name,
        slug=slug,
        description=data.description,
        created_at=datetime.utcnow(),
        created_by=user_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get(
    "/train_objectives/{objective_id}",
    response_model=TrainObjectiveRead,
    summary="Obtener un objetivo de entrenamiento por ID",
)
def get_train_objective(objective_id: int, db: Session = Depends(get_db)):
    obj = db.query(TrainObjective).filter_by(id=objective_id).first()
    if not obj:
        raise HTTPException(404, detail="TrainObjective no encontrado")
    return obj


@router.post(
    "/train_objectives/{objective_id}/completions",
    response_model=CompletionRead,
    summary="Agregar una completion a un objetivo",
)
def add_completion(
    objective_id: int,
    data: CompletionCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id),
):
    objective = db.query(TrainObjective).filter_by(id=objective_id).first()
    if not objective:
        raise HTTPException(404, "TrainObjective no encontrado")

    comp = Completion(
        prompt=data.prompt,
        output=data.completion,
        train_objective_id=objective_id,
        created_by=user_id,
        created_at=datetime.utcnow(),
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return CompletionRead(
        id=comp.id,
        prompt=comp.prompt,
        completion=comp.output,
        objective_id=comp.train_objective_id,
        created_at=comp.created_at,
    )


@router.get(
    "/train_objectives/{objective_id}/completions",
    response_model=List[CompletionRead],
    summary="Listar las completions de un objetivo",
)
def list_completions(
    objective_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id),
):
    completions = db.query(Completion).filter_by(train_objective_id=objective_id).all()
    return [
        CompletionRead(
            id=c.id,
            prompt=c.prompt,
            completion=c.output,
            objective_id=c.train_objective_id,
            created_at=c.created_at,
        )
        for c in completions
    ]


@router.post(
    "/train_objectives/{objective_id}/training_jobs",
    response_model=TrainingJobRead,
    summary="Iniciar un trabajo de fine-tuning",
)
def start_training_job(
    objective_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id),
):
    objective = db.query(TrainObjective).filter_by(id=objective_id).first()
    if not objective:
        raise HTTPException(404, "TrainObjective no encontrado")

    job = TrainingJob(
        model_from="base-model",
        status="queued",
        created_at=datetime.now(datetime.UTC),
        train_objective_id=objective_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get(
    "/train_objectives/{objective_id}/training_jobs",
    response_model=List[TrainingJobRead],
    summary="Listar trabajos de entrenamiento de un objetivo",
)
def list_training_jobs(
    objective_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id),
):
    jobs = db.query(TrainingJob).filter_by(train_objective_id=objective_id).all()
    return jobs


SENTENCIAS_API_URL = os.getenv("SENTENCIAS_API_URL", "http://localhost:8006")
MAX_TIMEOUT = int(os.getenv("MAX_TIMEOUT", 540.0))

print("Servidor de Sentencias API apuntando a: ", SENTENCIAS_API_URL)


@router.get("/sentencia/{hash}", summary="Obtener una sentencia ciudadana")
async def proxy_get_sentence(hash: str):
    access_token = get_access_token()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SENTENCIAS_API_URL}/api/sentencia/{hash}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()


@router.put("/sentencia/{hash}", summary="Actualizar una sentencia ciudadana")
async def proxy_update_sentence(hash: str, request: Request):
    body = await request.json()
    access_token = get_access_token()
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{SENTENCIAS_API_URL}/api/sentencia/{hash}",
            json=body,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()


@router.post(
    "/sentencia/{hash}/request-changes",
    summary="Solicitar cambios a una sentencia ciudadana",
)
async def proxy_request_changes(hash: str, request: Request):
    body = await request.json()
    access_token = get_access_token()
    async with httpx.AsyncClient(
        timeout=Timeout(MAX_TIMEOUT, read=MAX_TIMEOUT)
    ) as client:
        response = await client.post(
            f"{SENTENCIAS_API_URL}/api/sentencia/{hash}/request-changes",
            json=body,
            headers={"Authorization": f"Bearer {access_token}"},
        )

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type", "application/json"),
    )


@router.post("/generate-sentence-brief")
async def generate_sentence_brief_proxy(request: Request):
    access_token = get_access_token()

    # Leer el body crudo
    body = await request.body()

    # Obtener el content-type original (multipart/form-data con boundary)
    content_type = request.headers.get("content-type")

    if not content_type:
        raise HTTPException(status_code=400, detail="Falta Content-Type")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": content_type,
    }

    async with httpx.AsyncClient(
        timeout=Timeout(MAX_TIMEOUT, read=MAX_TIMEOUT)
    ) as client:
        response = await client.post(
            f"{SENTENCIAS_API_URL}/api/generate-sentence-brief",
            content=body,
            headers=headers,
        )

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type", "application/json"),
    )
