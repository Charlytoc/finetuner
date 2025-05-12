import os
import httpx
from urllib.parse import urlencode

from fastapi.responses import FileResponse

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from server.utils.printer import Printer
from server.routes import router

printer = Printer("MAIN")
ENVIRONMENT = os.getenv("ENVIRONMENT", "prod").lower().strip()

printer.green("🚀 Iniciando aplicación en modo: ", ENVIRONMENT)


@asynccontextmanager
async def lifespan(app: FastAPI):
    printer.green("🚀 Iniciando aplicación en modo: ", ENVIRONMENT)

    yield


app = FastAPI(lifespan=lifespan)

raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if raw_origins != "*":
    ALLOWED_ORIGINS = [
        o if o.startswith("http") else f"http://{o}"
        for o in map(str.strip, raw_origins.split(","))
    ]
else:
    printer.red(
        "PELIGRO: ALLOWED_ORIGINS es *, cualquier origen puede acceder a la API."
    )
    if ENVIRONMENT == "prod":
        raise Exception("ALLOWED_ORIGINS es * en producción")
    ALLOWED_ORIGINS = "*"


raw_ips = os.getenv("ALLOWED_IPS", "")
if raw_ips != "":
    ALLOWED_IPS = [ip.strip() for ip in raw_ips.split(",")]
else:
    ALLOWED_IPS = []


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def auth_and_cors(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin:
        if ALLOWED_ORIGINS != "*" and origin not in ALLOWED_ORIGINS:
            printer.yellow(f"Origin '{origin}' no permitido.")
            return JSONResponse(
                status_code=403, content={"detail": f"Origin '{origin}' no permitido."}
            )
    else:
        client_ip = request.client.host
        if len(ALLOWED_IPS) > 0 and client_ip not in ALLOWED_IPS:
            printer.yellow(f"IP '{client_ip}' no permitida.")
            return JSONResponse(
                status_code=403, content={"detail": f"IP '{client_ip}' no permitida."}
            )

    CHECK_AUTH = ENVIRONMENT == "prod"
    if CHECK_AUTH:
        auth: str = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            printer.yellow("No se encontró el token en el header")
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or malformed Authorization header."},
            )
        token = auth.split(" ", 1)[1]

        validate_url = os.getenv(
            "TOKEN_VALIDATION_URL",
            "https://declaraciones.pjedomex.gob.mx/declaraciones/gestion",
        )

        payload = {"access_token": token}
        printer.yellow("Validando token...")
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Content-Type": "application/x-www-form-urlencoded"}

            resp = await client.post(validate_url, data=payload, headers=headers)

            body = urlencode(payload)
            resp = await client.post(validate_url, data=body, headers=headers)
        if resp.status_code != 200:
            return JSONResponse(
                status_code=401, content={"detail": "Invalid or expired token."}
            )
    else:
        printer.yellow(
            "No se validó el token, se asume que es un request de desarrollo"
        )
    printer.green("Una solicitud fue permitida con éxito")
    return await call_next(request)


app.include_router(router)

PORT = int(os.getenv("PORT", 8005))


# Justo después de app.include_router(router):
if ENVIRONMENT != "prod":
    app.mount("/client", StaticFiles(directory="client", html=True), name="client")

    @app.get("/client", include_in_schema=False)
    async def serve_client_index():
        return FileResponse(
            os.path.join("client", "index.html"), media_type="text/html"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=PORT, reload=True)
