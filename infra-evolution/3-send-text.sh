#!/usr/bin/env bash
# Envia uma mensagem de texto de teste via Evolution API.
# Uso: set -a; source .env; set +a; ./3-send-text.sh "5511999999999" "Ola mundo"
set -euo pipefail

: "${SERVER_URL:?defina SERVER_URL no .env}"
: "${AUTHENTICATION_API_KEY:?defina AUTHENTICATION_API_KEY no .env}"
: "${INSTANCE_NAME:?defina INSTANCE_NAME no .env}"

TO="${1:-${WHATSAPP_NUMBER:?informe o numero como 1o argumento ou defina WHATSAPP_NUMBER}}"
TEXT="${2:-Teste Evolution API ✅}"

curl -sS -X POST "$SERVER_URL/message/sendText/$INSTANCE_NAME" \
  -H "Content-Type: application/json" \
  -H "apikey: $AUTHENTICATION_API_KEY" \
  -d "{\"number\": \"$TO\", \"text\": \"$TEXT\"}" | tee /dev/stderr
echo
