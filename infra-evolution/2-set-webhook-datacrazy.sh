#!/usr/bin/env bash
# Configura o webhook da Evolution API para enviar eventos ao DataCrazy.
# Uso: set -a; source .env; set +a; ./2-set-webhook-datacrazy.sh
set -euo pipefail

: "${SERVER_URL:?defina SERVER_URL no .env}"
: "${AUTHENTICATION_API_KEY:?defina AUTHENTICATION_API_KEY no .env}"
: "${INSTANCE_NAME:?defina INSTANCE_NAME no .env}"
: "${DATACRAZY_WEBHOOK_URL:?defina DATACRAZY_WEBHOOK_URL no .env}"

curl -sS -X POST "$SERVER_URL/webhook/set/$INSTANCE_NAME" \
  -H "Content-Type: application/json" \
  -H "apikey: $AUTHENTICATION_API_KEY" \
  -d "{
    \"webhook\": {
      \"enabled\": true,
      \"url\": \"$DATACRAZY_WEBHOOK_URL\",
      \"events\": [
        \"MESSAGES_UPSERT\",
        \"MESSAGES_UPDATE\",
        \"SEND_MESSAGE\",
        \"CONNECTION_UPDATE\"
      ]
    }
  }" | tee /dev/stderr
echo
