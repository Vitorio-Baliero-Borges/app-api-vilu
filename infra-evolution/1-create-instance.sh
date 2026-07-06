#!/usr/bin/env bash
# Cria a instancia na Evolution API conectada a Cloud API da Meta.
# Uso: carregue as variaveis do .env e rode  ->  set -a; source .env; set +a; ./1-create-instance.sh
set -euo pipefail

: "${SERVER_URL:?defina SERVER_URL no .env}"
: "${AUTHENTICATION_API_KEY:?defina AUTHENTICATION_API_KEY no .env}"
: "${INSTANCE_NAME:?defina INSTANCE_NAME no .env}"
: "${WHATSAPP_NUMBER:?defina WHATSAPP_NUMBER no .env}"
: "${META_ACCESS_TOKEN:?defina META_ACCESS_TOKEN no .env}"
: "${WABA_ID:?defina WABA_ID no .env}"
: "${PHONE_NUMBER_ID:?defina PHONE_NUMBER_ID no .env}"

curl -sS -X POST "$SERVER_URL/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: $AUTHENTICATION_API_KEY" \
  -d "{
    \"instanceName\": \"$INSTANCE_NAME\",
    \"integration\": \"WHATSAPP-BUSINESS\",
    \"number\": \"$WHATSAPP_NUMBER\",
    \"token\": \"$META_ACCESS_TOKEN\",
    \"businessId\": \"$WABA_ID\",
    \"phoneNumberId\": \"$PHONE_NUMBER_ID\"
  }" | tee /dev/stderr
echo
