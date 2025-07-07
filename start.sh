#!/usr/bin/env bash
set -e

# ----------------------------------------
# 1) Parseo de flags (-m prod|dev, -p puerto)
# ----------------------------------------
MODE=""
PORT=""

# Parseo de flags cortos con getopts
while getopts ":m:p:" opt; do
  case ${opt} in
    m )
      MODE="${OPTARG,,}"
      ;;
    p )
      PORT="$OPTARG"
      ;;
    \? )
      echo "Uso: $0 [-m prod|dev] [-p puerto]"
      exit 1
      ;;
  esac
done
shift $((OPTIND -1))

# Parseo de flags largos manualmente (--port)
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      if [[ -n "$2" && "$2" != -* ]]; then
        PORT="$2"
        shift 2
      else
        echo "❌ Se esperaba un valor para --port (ej: 8006)"
        exit 1
      fi
      ;;
    *)
      break
      ;;
  esac
done

# Si no viene -m, lo preguntamos
if [[ -z "$MODE" ]]; then
  while true; do
    read -p "¿Modo de ejecución (prod/dev)? " MODE
    MODE="${MODE,,}"
    if [[ "$MODE" == "prod" || "$MODE" == "dev" ]]; then
      break
    fi
    echo "  → Por favor escribe 'prod' o 'dev'"
  done
fi

# Si no viene -p/--port, lo preguntamos
if [[ -z "$PORT" ]]; then
  read -p "¿En qué puerto quieres correr la app? [8006]: " PORT
  PORT="${PORT:-8006}"
fi

export ENVIRONMENT="$MODE"
echo "ENVIRONMENT='$ENVIRONMENT'"
echo "PORT='$PORT'"

# ----------------------------------------
# 1.5) Verificar contenedor PostgreSQL
# ----------------------------------------
PG_CONTAINER="postgres_trainer"
PG_STATUS=$(docker ps -a --filter "name=^${PG_CONTAINER}$" --format "{{.Status}}")

if [[ -z "$PG_STATUS" ]]; then
  echo "❌ El contenedor '$PG_CONTAINER' no existe. Debes crearlo primero con el script de setup."
  exit 1
elif [[ "$PG_STATUS" != Up* ]]; then
  echo "🔁 El contenedor '$PG_CONTAINER' está detenido. Iniciándolo…"
  docker start "$PG_CONTAINER" > /dev/null
else
  echo "✅ El contenedor '$PG_CONTAINER' ya está corriendo."
fi

# ----------------------------------------
# 2) Creamos venv si hace falta
# ----------------------------------------
# Escoger python3 o python
if command -v python3 &>/dev/null; then PYTHON=python3; else PYTHON=python; fi

if [[ ! -d "venv" ]]; then
  echo "Creando virtualenv con $PYTHON …"
  $PYTHON -m venv venv
fi

# ----------------------------------------
# 3) Instalamos deps via pip del venv
# ----------------------------------------
# Detectar rutas dentro de venv
if [[ -f "venv/bin/python" ]]; then
  VENV_PYTHON=venv/bin/python
  VENV_PIP=venv/bin/pip
elif [[ -f "venv/Scripts/python.exe" ]]; then
  VENV_PYTHON=venv/Scripts/python.exe
  VENV_PIP=venv/Scripts/pip.exe
else
  echo "ERROR: no encontré python dentro de venv/"
  exit 1
fi

echo "Instalando requirements.txt…"
"$VENV_PIP" install -r requirements.txt --quiet

# ----------------------------------------
# 4) Arrancamos la app
# ----------------------------------------
APP_MODULE="main:app"

# Detectar sistema operativo
if [[ "$(uname -s 2>/dev/null)" =~ (Linux|Darwin) ]]; then
  IS_LINUX_OR_MAC=1
else
  IS_LINUX_OR_MAC=0
fi

if [[ "$MODE" == "prod" && "$IS_LINUX_OR_MAC" -eq 1 ]]; then
  echo "Iniciando app con Gunicorn (modo producción, Linux/Mac)…"
  "$VENV_PYTHON" -m gunicorn "$APP_MODULE" -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 4
else
  echo "Iniciando app con Uvicorn (modo desarrollo o Windows)…"
  "$VENV_PYTHON" -m uvicorn "$APP_MODULE" --host 0.0.0.0 --port $PORT --reload
fi