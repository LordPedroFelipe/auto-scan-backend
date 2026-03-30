# Backend Auto Scan

Backend em NestJS + TypeORM + PostgreSQL para o projeto Auto Scan.

## Portal de documentacao

O backend agora possui um portal de documentacao em Docusaurus dentro de [docs-site](../auto-scan/backend/docs-site).

Scripts principais:

- `npm run docs:install`
- `npm run docs:dev`
- `npm run docs:build`
- `npm run docs:serve`

## Stack

- NestJS
- TypeORM
- PostgreSQL
- JWT
- class-validator
- @nestjs/schedule
- OpenAI SDK
- Swagger/OpenAPI
- Docker Compose

## Modulos atuais

- `Auth`
- `Users`
- `Permissions`
- `Shops`
- `Vehicles`
- `Leads`
- `LeadNotes`
- `TestDrives`
- `QrCode`
- `Reports`
- `Subscriptions`
- `InventorySync`
- `Chat`
- `Email`
- `Settings`

## Como rodar com Docker

```bash
cd backend
docker compose up --build
```

Servicos locais:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- PostgreSQL: `localhost:5433`

Parar stack:

```bash
docker compose down
```

Apagar volumes do banco:

```bash
docker compose down -v
```

## Como rodar localmente sem Docker

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

Opcional:

```bash
npm run seed
```

## Scripts principais

- `npm run build`
- `npm run lint`
- `npm run migration:run`
- `npm run seed`
- `npm run inventory:sync`
- `npm run wait:db`
- `npm run docker:up`
- `npm run docker:down`
- `npm run docker:down:volumes`
- `npm run docs:install`
- `npm run docs:dev`
- `npm run docs:build`
- `npm run docs:serve`

## Documentacao do backend

O conteudo principal foi reorganizado no Docusaurus com trilhas para:

- visao geral e getting started
- arquitetura por dominio
- operacao e ambientes
- integracoes de estoque, IA, cobranca e comunicacao
- Swagger e contratos da API

Documentos-base mantidos no repositorio:

- [AI_CHAT_ARCHITECTURE.md](../auto-scan/backend/AI_CHAT_ARCHITECTURE.md)
- [ARQUITETURA_BACKEND.md](../auto-scan/backend/ARQUITETURA_BACKEND.md)
- [OPERACAO_E_AMBIENTES.md](../auto-scan/backend/OPERACAO_E_AMBIENTES.md)
- [INTEGRACAO_ESTOQUE_E_OPERACAO.md](../auto-scan/backend/INTEGRACAO_ESTOQUE_E_OPERACAO.md)

## Variaveis de ambiente

Arquivo base:

- [backend/.env.example](../auto-scan/backend/.env.example)

Campos atuais:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INVENTORY_SYNC_RUN_ON_STARTUP`
- `DB_WAIT_MAX_ATTEMPTS`
- `DB_WAIT_DELAY_MS`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `FRONTEND_BASE_URL`
- `MAIL_FROM_NAME`
- `MAIL_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `ASAAS_API_KEY`
- `ASAAS_ENV`
- `ASAAS_BASE_URL`
- `ASAAS_WEBHOOK_URL`
- `ASAAS_WALLET_ID`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_TIMEOUT_MS`

## Integracao de estoque

O backend ja possui integracao real de estoque por loja com:

- feed externo por loja
- cron por loja
- sincronizacao manual
- status da ultima integracao
- desativacao logica de itens que saem do feed

Documento principal:

- [INTEGRACAO_ESTOQUE_E_OPERACAO.md](../auto-scan/backend/INTEGRACAO_ESTOQUE_E_OPERACAO.md)

## Chat IA

O backend ja possui uma base real de vendedor digital com:

- persistencia de sessoes e mensagens
- streaming SSE
- recomendacao de veiculos reais
- criacao automatica de lead
- handoff para vendedor
- simulacao inicial de financiamento
- observabilidade da IA

Documento principal:

- [AI_CHAT_ARCHITECTURE.md](../auto-scan/backend/AI_CHAT_ARCHITECTURE.md)
