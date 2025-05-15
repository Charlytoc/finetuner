#!/usr/bin/env bash
set -e

# ----------------------------------------
# 1) Parseo de flags (-m prod|dev)
# ----------------------------------------
MODE=""
while getopts ":m:" opt; do
  case ${opt} in
    m )
      MODE="${OPTARG,,}"
      ;;
    \? )
      echo "Uso: $0 [-m prod|dev]"
      exit 1
      ;;
  esac
done
shift $((OPTIND -1))

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

export ENVIRONMENT="$MODE"
echo "ENVIRONMENT='$ENVIRONMENT'"

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
echo "Iniciando app con $VENV_PYTHON main.py …"
"$VENV_PYTHON" main.py
