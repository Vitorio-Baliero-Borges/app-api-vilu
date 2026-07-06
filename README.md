# Api Vilu

App (Vite + React) para conectar um numero de **WhatsApp Business** a **Cloud API oficial da Meta** em modo **coexistencia** (mantendo o app do celular), alem de servir os assets exigidos pela **analise do app** da Meta (Politica de Privacidade, Termos e tela de teste de envio para o video).

## Paginas
- `/` — Conectar numero (Embedded Signup, coexistencia) + status da conexao (WABA ID / Phone Number ID)
- `/teste` — Enviar mensagem de teste via Cloud API (para gravar o video da analise)
- `/privacidade` — Politica de Privacidade (URL exigida pela Meta)
- `/termos` — Termos de Uso

## Rodar localmente
```bash
npm install
cp .env.example .env   # preencha VITE_APP_ID e VITE_CONFIGURATION_ID
npm run dev
```

## Deploy — GitHub + Vercel
1. **GitHub:** crie um repositorio e suba o projeto:
   ```bash
   git init
   git add .
   git commit -m "Api Vilu - primeira versao"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/api-vilu.git
   git push -u origin main
   ```
2. **Vercel:** entre em vercel.com > Add New Project > Import do repositorio.
   - Framework Preset: **Vite** (detectado automaticamente)
   - Build Command: `npm run build` · Output: `dist`
   - Em **Settings > Environment Variables**, adicione:
     - `VITE_APP_ID`
     - `VITE_CONFIGURATION_ID`
     - `VITE_GRAPH_VERSION` = `v21.0`
   - Deploy. Voce recebe uma URL HTTPS, ex.: `https://api-vilu.vercel.app`

O `vercel.json` ja faz o rewrite de SPA (as rotas /privacidade, /termos etc. funcionam no deploy).

## Configurar o dominio na Meta (depois do deploy)
Use a URL da Vercel nos campos da analise do app:
- **URL da Politica de Privacidade:** `https://SEU_APP.vercel.app/privacidade`
- **URL dos Termos:** `https://SEU_APP.vercel.app/termos`
- **Dominio do app / do Embedded Signup:** `SEU_APP.vercel.app`
- Em **Login do Facebook para Empresas > Configuracoes**, adicione a URL da Vercel em "URIs de redirecionamento OAuth validos" e dominios permitidos.

## Checklist da Analise do App (Meta)
- [ ] Verificacao da empresa (BM) aprovada
- [ ] Provedor de Tecnologia habilitado
- [ ] Icone do app enviado (use `public/logo.svg` ou um PNG 1024x1024)
- [ ] Categoria do app selecionada
- [ ] URL de Politica de Privacidade = `/privacidade` (deploy da Vercel)
- [ ] Configuration ID do Embedded Signup criado e colocado em `VITE_CONFIGURATION_ID`
- [ ] Video 1 (`whatsapp_business_messaging`): app enviando msg + WhatsApp recebendo (use a tela `/teste`)
- [ ] Video 2 (`whatsapp_business_management`): chamadas de API de teste (use o curl da tela `/teste`)
- [ ] Submeter para App Review

## Observacoes
- Troque nome/e-mail/versao em `src/config.js`.
- A tela `/teste` guarda token/IDs apenas no navegador (nao ha backend).
- Se o envio pelo navegador falhar por CORS, use o comando `curl` exibido na propria tela.
