---
title: Variáveis de Ambiente
description: Referência operacional das variáveis obrigatórias e sensíveis do backend.
---

# Variáveis de Ambiente

Use `backend/.env.example` como base, mas trate este documento como a referência operacional para preparar homologação e produção.

## Banco

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`

## Aplicação

- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_BASE_URL`

## Operação e bootstrap

- `DB_WAIT_MAX_ATTEMPTS`
- `DB_WAIT_DELAY_MS`
- `INVENTORY_SYNC_RUN_ON_STARTUP`

## OpenAI

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Email

- `MAIL_FROM_NAME`
- `MAIL_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`

## Asaas

- `ASAAS_API_KEY`
- `ASAAS_ENV`
- `ASAAS_BASE_URL`
- `ASAAS_WEBHOOK_URL`
- `ASAAS_WALLET_ID`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_TIMEOUT_MS`

## Obrigatórias em produção

- `JWT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `FRONTEND_BASE_URL`
- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_URL`
- `ASAAS_WEBHOOK_TOKEN`

## Boas práticas

- não versionar `.env`
- segregar segredos por ambiente
- rotacionar `JWT_SECRET` e credenciais SMTP/Asaas com processo controlado
- revisar impacto de qualquer variável nova antes do deploy
- documentar defaults perigosos que só servem para desenvolvimento

## Checklist rápido antes de subir

- domínio do frontend correto em `FRONTEND_BASE_URL`
- ambiente do Asaas coerente com a base URL
- webhook do Asaas apontando para o backend correto
- credenciais SMTP válidas para envio real
- modelo OpenAI existente e autorizado no projeto
