# Api WhatsApp Project — Evolution API + WhatsApp Cloud API + Supabase

Arquivos de configuração prontos para subir a Evolution API integrada à Cloud API oficial da Meta, usando **Supabase** como banco de dados.

## Arquivos

| Arquivo | Para que serve |
|---------|----------------|
| `docker-compose.yaml` | Sobe a Evolution API + Redis. Banco aponta para o Supabase. |
| `.env.example` | Modelo de variáveis. Copie para `.env` e preencha. |
| `nginx-evolution.conf` | Proxy reverso HTTPS → porta 8080 da Evolution. |
| `1-create-instance.sh` | Cria a instância conectada à Meta Cloud API. |
| `2-set-webhook-datacrazy.sh` | Aponta o webhook da Evolution para o DataCrazy. |
| `3-send-text.sh` | Envia uma mensagem de texto de teste. |

## Passo a passo resumido

1. **Supabase:** crie um projeto em https://supabase.com e copie a *connection string* (Project Settings → Database). Use a porta **5432** para as migrations.
2. **VPS:** instale Docker, aponte o domínio (DNS tipo A) e configure Nginx + SSL com o `nginx-evolution.conf`.
3. **Config:** `cp .env.example .env` e preencha (SERVER_URL, API key, connection string do Supabase, dados da Meta).
4. **Subir:**
   ```bash
   docker compose up -d
   docker compose logs -f evolution-api
   ```
   Na primeira subida a Evolution cria as tabelas no Supabase (confira em Table Editor).
5. **Conectar à Meta:**
   ```bash
   set -a; source .env; set +a
   ./1-create-instance.sh
   ```
   Depois configure o webhook no painel da Meta: `https://SEU_DOMINIO/webhook/meta`.
6. **DataCrazy:**
   ```bash
   ./2-set-webhook-datacrazy.sh
   ./3-send-text.sh 5511999999999 "Funcionou ✅"
   ```

> Guia completo por fases está no Obsidian, na pasta **Api WhatsApp Project**.

## Nota sobre a porta do Supabase
- **5432** (conexão direta): melhor para migrations/DDL da Evolution.
- **6543** (pooler/PgBouncer): melhor para muitas conexões simultâneas, mas pode dar erro de *prepared statements*. Se ocorrer, volte para a 5432.
