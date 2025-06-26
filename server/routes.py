import os
from fastapi import Response

# from typing import List
# import uuid
# from datetime import datetime

import httpx
from httpx import Timeout
from fastapi import Request
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# from server.utils.auth import get_access_token
from server.utils.csv_logger import CSVLogger
from server.db.models import User
from server.db.core import get_db
from server.utils.schemas import (
    UserRead,
    UserLogin,
)


router = APIRouter(prefix="/api/v1")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
csv_logger = CSVLogger()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/login", response_model=UserRead, summary="Login clásico sin JWT")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    csv_logger.log(
        endpoint="POST /api/login",
        http_status=200,
        hash_=user.id,
        message="Login exitoso",
        exit_status=0,
    )
    return user


SENTENCIAS_API_URL = os.getenv("SENTENCIAS_API_URL", "http://localhost:8006")
MAX_TIMEOUT = int(os.getenv("MAX_TIMEOUT", 540.0))

print("Servidor de Sentencias API apuntando a: ", SENTENCIAS_API_URL)


@router.get("/sentencia/{hash}", summary="Obtener una sentencia ciudadana")
async def proxy_get_sentence(hash: str):
    try:
        async with httpx.AsyncClient(
            timeout=Timeout(MAX_TIMEOUT, read=MAX_TIMEOUT)
        ) as client:
            response = await client.get(
                f"{SENTENCIAS_API_URL}/api/sentencia/{hash}",
            )
        if response.status_code == 200:
            csv_logger.log(
                endpoint="GET /api/sentencia/{hash}",
                http_status=response.status_code,
                hash_=hash,
                message=response.text,
                exit_status=0,
            )
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)
    except HTTPException as e:
        csv_logger.log(
            endpoint="GET /api/sentencia/{hash}",
            http_status=e.status_code,
            hash_=hash,
            message=e.detail,
            exit_status=1,
        )
        raise
    except Exception as e:
        csv_logger.log(
            endpoint="GET /api/sentencia/{hash}",
            http_status=500,
            hash_=hash,
            message=str(e),
            exit_status=1,
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/sentencia/{hash}", summary="Actualizar una sentencia ciudadana")
async def proxy_update_sentence(hash: str, request: Request):
    try:
        body = await request.json()
        async with httpx.AsyncClient(
            timeout=Timeout(MAX_TIMEOUT, read=MAX_TIMEOUT)
        ) as client:
            response = await client.put(
                f"{SENTENCIAS_API_URL}/api/sentencia/{hash}",
                json=body,
            )
        if response.status_code < 400:
            csv_logger.log(
                endpoint="PUT /api/sentencia/{hash}",
                http_status=response.status_code,
                hash_=hash,
                message=response.text,
                exit_status=0,
            )
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)
    except HTTPException as e:
        csv_logger.log(
            endpoint="PUT /api/sentencia/{hash}",
            http_status=e.status_code,
            hash_=hash,
            message=e.detail,
            exit_status=1,
        )
        raise
    except Exception as e:
        csv_logger.log(
            endpoint="PUT /api/sentencia/{hash}",
            http_status=500,
            hash_=hash,
            message=str(e),
            exit_status=1,
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/sentencia/{hash}/request-changes",
    summary="Solicitar cambios a una sentencia ciudadana",
)
async def proxy_request_changes(hash: str, request: Request):
    try:
        body = await request.json()
        async with httpx.AsyncClient(
            timeout=Timeout(MAX_TIMEOUT, read=MAX_TIMEOUT)
        ) as client:
            response = await client.post(
                f"{SENTENCIAS_API_URL}/api/sentencia/{hash}/request-changes",
                json=body,
            )
        if response.status_code < 400:
            csv_logger.log(
                endpoint="POST /api/sentencia/{hash}/request-changes",
                http_status=response.status_code,
                hash_=hash,
                message=response.text,
                exit_status=0,
            )
        else:
            csv_logger.log(
                endpoint="POST /api/sentencia/{hash}/request-changes",
                http_status=response.status_code,
                hash_=hash,
                message=response.text,
                exit_status=1,
            )
        return Response(
            content=response.content,
            status_code=response.status_code,
            media_type=response.headers.get("content-type", "application/json"),
        )
    except HTTPException as e:
        csv_logger.log(
            endpoint="POST /api/sentencia/{hash}/request-changes",
            http_status=e.status_code,
            hash_=hash,
            message=e.detail,
            exit_status=1,
        )
        raise
    except Exception as e:
        csv_logger.log(
            endpoint="POST /api/sentencia/{hash}/request-changes",
            http_status=500,
            hash_=hash,
            message=str(e),
            exit_status=1,
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-sentence-brief")
async def generate_sentence_brief_proxy(request: Request):
    print("generate_sentence_brief_proxy request")
    try:
        body = await request.body()
        content_type = request.headers.get("content-type")
        if not content_type:
            csv_logger.log(
                endpoint="POST /generate-sentence-brief",
                http_status=400,
                hash_="N/A",
                message="Falta Content-Type",
                exit_status=1,
            )
            raise HTTPException(status_code=400, detail="Falta el header Content-Type")

        headers = {
            "Content-Type": content_type,
        }

        async with httpx.AsyncClient(
            timeout=Timeout(MAX_TIMEOUT, read=MAX_TIMEOUT)
        ) as client:
            sentencias_url = f"{SENTENCIAS_API_URL}/api/generate-sentence-brief"
            print("sentencias_url to redirect: ", sentencias_url)
            response = await client.post(
                sentencias_url,
                content=body,
                headers=headers,
            )

        result = response.json()

        if response.status_code < 400:
            csv_logger.log(
                endpoint="POST /generate-sentence-brief",
                http_status=response.status_code,
                hash_=result["hash"],
                message=result["message"],
                exit_status=0,
            )
        else:
            csv_logger.log(
                endpoint="POST /generate-sentence-brief",
                http_status=response.status_code,
                hash_=result.get("hash", "N/A"),
                message=result.get("message", "Error desconocido"),
                exit_status=1,
            )

        return Response(
            content=response.content,
            status_code=response.status_code,
            media_type=response.headers.get("content-type", "application/json"),
        )
    except HTTPException as e:
        csv_logger.log(
            endpoint="POST /generate-sentence-brief",
            http_status=e.status_code,
            hash_="N/A",
            message=e.detail,
            exit_status=1,
        )
        raise
    except Exception as e:
        csv_logger.log(
            endpoint="POST /generate-sentence-brief",
            http_status=500,
            hash_="N/A",
            message=str(e),
            exit_status=1,
        )
        raise HTTPException(status_code=500, detail=str(e))
