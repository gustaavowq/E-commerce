#!/bin/sh
# =============================================================================
# wait-for-postgres.sh
# Aguarda o postgres ficar pronto antes de seguir.
# Uso: ./wait-for-postgres.sh <host> <port> -- comando-real
# =============================================================================
set -e

host="$1"
port="$2"
shift 2

echo "[wait-for-postgres] aguardando $host:$port ficar disponível..."

# pg_isready é mais confiável que TCP probe puro
until pg_isready -h "$host" -p "$port" -q; do
  echo "[wait-for-postgres] ainda nao pronto, tentando de novo em 1s..."
  sleep 1
done

echo "[wait-for-postgres] postgres pronto. executando: $@"
exec "$@"
