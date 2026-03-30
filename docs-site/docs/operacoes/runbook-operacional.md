---
title: Runbook Operacional
description: Checklist pratico para diagnostico, onboarding e suporte do backend.
---

# Runbook Operacional

Este runbook concentra as acoes mais comuns do dia a dia tecnico e operacional.

## Onboarding tecnico rapido

1. copiar `.env.example` para `.env`
2. subir com Docker ou configurar PostgreSQL local
3. executar `npm install`
4. executar `npm run migration:run`
5. subir a API com `npm run start:dev`
6. validar Swagger em `http://localhost:3000/api/docs`

## Comandos mais usados

```bash
npm run build
npm run lint
npm run migration:run
npm run seed
npm run inventory:sync
npm run docs:dev
npm run docs:build
```

## Quando validar estoque

- apos cadastrar ou alterar feed de loja
- apos mudar cron ou flags de sincronizacao
- apos atualizacao de parser do feed
- apos incidente de divergencia comercial

## Quando validar cobranca

- apos mudar variaveis do Asaas
- apos onboarding de nova loja pagante
- apos alteracoes em plano, pagamento ou assinatura
- apos falha de webhook ou inconsistencias de status

Para o procedimento detalhado, use tambem o [Runbook de Cobranca](./runbook-de-cobranca.md).

## Quando validar email

- apos configurar SMTP
- apos trocar remetente padrao
- apos incidentes de entrega ou rejeicao

## Checklist minimo antes de release

- lint sem erro
- build sem erro
- migrations revisadas
- Swagger coerente com os DTOs
- variaveis de ambiente novas documentadas
- fluxos criticos validados: auth, estoque, cobranca, chat

## Incidentes recorrentes para olhar primeiro

### API nao sobe

- conferir `PORT` e `.env`
- validar conexao com banco
- rodar `npm run migration:run`

### Estoque nao sincroniza

- conferir `inventoryFeedUrl`
- validar JSON do feed
- revisar `inventorySyncEnabled`
- inspecionar status e erro da ultima loja

### Chat sem refinamento de IA

- conferir `OPENAI_API_KEY`
- validar `OPENAI_MODEL`
- checar fallback deterministico e telemetria

### Cobranca sem prontidao completa

- conferir `ASAAS_API_KEY`
- revisar `ASAAS_ENV`
- revisar `ASAAS_BASE_URL`
- revisar `ASAAS_WEBHOOK_URL`
- revisar `ASAAS_WALLET_ID`
- revisar `ASAAS_WEBHOOK_TOKEN`
