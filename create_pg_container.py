#!/usr/bin/env python3
import os
import subprocess
import shutil
import sys
from pathlib import Path
from time import sleep
from dotenv import load_dotenv

# ───────────────────────────────────────────────
# 🧱 CONFIGURACIÓN
# ───────────────────────────────────────────────
POSTGRES_CONTAINER_NAME = "postgres_trainer"

# ───────────────────────────────────────────────
# 📦 CARGAR VARIABLES DE ENTORNO
# ───────────────────────────────────────────────
env_path = Path(".env")
if not env_path.exists():
    print("❌ No se encontró archivo .env")
    sys.exit(1)

load_dotenv(dotenv_path=env_path)

POSTGRES_VOLUME_HOST = os.getenv("POSTGRES_VOLUME_HOST")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_HOST_PORT = os.getenv("POSTGRES_HOST_PORT")
POSTGRES_CONTAINER_PORT = os.getenv("POSTGRES_CONTAINER_PORT")

# ───────────────────────────────────────────────
# ⚙️ VERIFICAR DOCKER
# ───────────────────────────────────────────────
if not shutil.which("docker"):
    print("❌ Docker no está instalado o no está en el PATH")
    sys.exit(1)

# ───────────────────────────────────────────────
# 📁 CREAR VOLUMEN LOCAL SI NO EXISTE
# ───────────────────────────────────────────────
print(f"📁 Verificando volumen en {POSTGRES_VOLUME_HOST}")
volume_path = Path(POSTGRES_VOLUME_HOST).resolve()
volume_path.mkdir(parents=True, exist_ok=True)

# Git Bash fix (Windows path)
if os.name == "nt":
    volume_path_str = str(volume_path).replace("\\", "/").replace("C:", "/c")
else:
    volume_path_str = str(volume_path)

# ───────────────────────────────────────────────
# 🧨 LIMPIAR CONTENEDOR ANTERIOR
# ───────────────────────────────────────────────
result = subprocess.run(
    ["docker", "ps", "-a", "--format", "{{.Names}}"], stdout=subprocess.PIPE, text=True
)

if POSTGRES_CONTAINER_NAME in result.stdout.splitlines():
    print(f"🧨 Eliminando contenedor previo: {POSTGRES_CONTAINER_NAME}")
    subprocess.run(["docker", "rm", "-f", POSTGRES_CONTAINER_NAME])

# ───────────────────────────────────────────────
# 🐘 CREAR NUEVO CONTENEDOR POSTGRESQL
# ───────────────────────────────────────────────
print(f"🚀 Iniciando PostgreSQL en puerto {POSTGRES_HOST_PORT}")
subprocess.run(
    [
        "docker",
        "run",
        "-d",
        "--name",
        POSTGRES_CONTAINER_NAME,
        "-e",
        f"POSTGRES_DB={POSTGRES_DB}",
        "-e",
        f"POSTGRES_USER={POSTGRES_USER}",
        "-e",
        f"POSTGRES_PASSWORD={POSTGRES_PASSWORD}",
        "-e",
        "POSTGRES_INITDB_ARGS=--auth-host=md5",
        "-p",
        f"{POSTGRES_HOST_PORT}:{POSTGRES_CONTAINER_PORT}",
        "-v",
        f"{volume_path_str}:/var/lib/postgresql/data",
        "postgres:latest",
    ]
)

print("⏳ Esperando PostgreSQL…")
sleep(5)

# ───────────────────────────────────────────────
# ✅ CONEXIÓN FINAL
# ───────────────────────────────────────────────
print("\n✅ PostgreSQL está corriendo")
print("🔌 Cadena de conexión (psql):")
print(
    f"postgres://{POSTGRES_USER}:{POSTGRES_PASSWORD}@127.0.0.1:{POSTGRES_HOST_PORT}/{POSTGRES_DB}"
)
print("\n🔌 JDBC URL:")
print(
    f"jdbc:postgresql://127.0.0.1:{POSTGRES_HOST_PORT}/{POSTGRES_DB}?user={POSTGRES_USER}&password={POSTGRES_PASSWORD}"
)
