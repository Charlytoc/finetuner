#!/usr/bin/env bash
set -e

# ───────────────────────────────────────────────
# 🧱 CONFIGURACIÓN
# ───────────────────────────────────────────────
POSTGRES_CONTAINER_NAME="postgres_trainer"

# ───────────────────────────────────────────────
# 📦 CARGAR VARIABLES DE ENTORNO
# ───────────────────────────────────────────────
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ No se encontró archivo .env"
  exit 1
fi

# ───────────────────────────────────────────────
# ⚙️ VERIFICAR DOCKER
# ───────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  echo "❌ Docker no está instalado o no está en el PATH"
  exit 1
fi

# ───────────────────────────────────────────────
# 📁 CREAR VOLUMEN LOCAL SI NO EXISTE
# ───────────────────────────────────────────────
echo "📁 Verificando volumen en $POSTGRES_VOLUME_HOST"
mkdir -p "$POSTGRES_VOLUME_HOST"

# 🔧 Normalizar path del volumen (Git Bash fix)
VOLUME_PATH=$(cd "$POSTGRES_VOLUME_HOST" && pwd)
if [[ "$OSTYPE" == "msys" ]]; then
  VOLUME_PATH=$(cd "$POSTGRES_VOLUME_HOST" && pwd -W | sed 's|\\|/|g' | sed 's|C:|/c|')
fi

# ───────────────────────────────────────────────
# 🧨 LIMPIAR CONTENEDOR ANTERIOR (SI EXISTE)
# ───────────────────────────────────────────────
if docker ps -a --format '{{.Names}}' | grep -Eq "^${POSTGRES_CONTAINER_NAME}$"; then
  echo "🧨 Eliminando contenedor previo: $POSTGRES_CONTAINER_NAME"
  docker rm -f "$POSTGRES_CONTAINER_NAME"
fi

# ───────────────────────────────────────────────
# 🐘 CREAR NUEVO CONTENEDOR POSTGRESQL
# ───────────────────────────────────────────────
echo "🚀 Iniciando PostgreSQL en puerto $POSTGRES_HOST_PORT"
docker run -d \
  --name "$POSTGRES_CONTAINER_NAME" \
  -e POSTGRES_DB="$POSTGRES_DB" \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -e POSTGRES_INITDB_ARGS="--auth-host=md5" \
  -p "$POSTGRES_HOST_PORT:$POSTGRES_CONTAINER_PORT" \
  -v "$VOLUME_PATH":/var/lib/postgresql/data \
  postgres:latest

# Esperar inicialización
echo "⏳ Esperando PostgreSQL…"
sleep 5

# ───────────────────────────────────────────────
# ✅ CONEXIÓN FINAL
# ───────────────────────────────────────────────
echo ""
echo "✅ PostgreSQL está corriendo"
echo "🔌 Cadena de conexión (psql):"
echo "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@127.0.0.1:$POSTGRES_HOST_PORT/$POSTGRES_DB"
echo ""
echo "🔌 JDBC URL:"
echo "jdbc:postgresql://127.0.0.1:$POSTGRES_HOST_PORT/$POSTGRES_DB?user=$POSTGRES_USER&password=$POSTGRES_PASSWORD"
