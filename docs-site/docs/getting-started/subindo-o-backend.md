---
title: Subindo o Backend
description: Guia pratico para levantar o backend localmente com e sem Docker.
---

# Subindo o Backend

Existem dois caminhos principais para trabalhar localmente: stack completa com Docker ou API local conectada a um PostgreSQL proprio.

## Opcao A: Docker completo

Este e o fluxo mais simples para iniciar rapido.

```bash
cd backend
docker compose up --build
```

### O que sobe

- `db`: PostgreSQL 16
- `backend`: API NestJS

### O que acontece automaticamente

1. o Postgres sobe
2. o banco `auto_scan` e criado
3. o backend aguarda o banco responder
4. as migrations sao executadas
5. a API compila e sobe na porta `3000`

### Endpoints locais

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- PostgreSQL: `localhost:5433`

## Opcao B: backend local + banco local

Use esse modo quando voce quiser depurar mais de perto ou rodar o banco fora do Docker.

### Pre-requisitos

- Node.js 20 ou superior
- PostgreSQL local
- banco `auto_scan` criado

### Variaveis base

Use o arquivo `backend/.env.example` como referencia.

Campos mais importantes:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `ASAAS_API_KEY`
- `SMTP_HOST`

### Passos

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

## Scripts mais usados

- `npm run build`
- `npm run lint`
- `npm run migration:run`
- `npm run seed`
- `npm run inventory:sync`
- `npm run docs:dev`
- `npm run docs:build`

## Observacao importante

O backend deve operar com `synchronize: false` e schema controlado apenas por migrations versionadas.
