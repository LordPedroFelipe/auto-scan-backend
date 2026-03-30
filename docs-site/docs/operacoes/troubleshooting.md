---
title: Troubleshooting
description: Guia rápido para diagnosticar falhas frequentes do backend em produção.
---

# Troubleshooting

Use esta página como atalho de diagnóstico para incidentes mais comuns.

## API não sobe

- revisar `.env`
- validar banco acessível
- executar `npm run migration:run`
- confirmar se a porta do processo está livre

## Login falha para todos os usuários

- revisar `JWT_SECRET`
- validar conexão com banco
- conferir se o backend publicado corresponde ao frontend atual

## Onboarding falha ao criar loja

- revisar conflito de email
- revisar conflito de CNPJ
- conferir formato de payload enviado pelo frontend
- verificar se o banco recebeu migrations recentes

## Cobrança falha

- revisar variáveis do Asaas
- testar checkout manual
- validar webhook publicado
- executar sincronização manual do pagamento

## Trial bloqueando acesso indevidamente

- verificar `createdAt` da loja
- verificar se existe pagamento com cobertura válida
- revisar `GET /api/Settings/overview`

## Email não entrega

- revisar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- validar remetente em `MAIL_FROM_EMAIL`
- testar autenticação SMTP fora do fluxo do app se necessário

## Estoque não sincroniza

- revisar `inventoryFeedUrl`
- validar JSON de origem
- revisar flags de sincronização da loja
- inspecionar status e erro da última execução

## Chat e IA degradados

- revisar `OPENAI_API_KEY`
- validar `OPENAI_MODEL`
- inspecionar logs de fallback

## Quando escalar

- erro recorrente de banco
- falha de migração em produção
- webhook do Asaas com perda de eventos
- 5xx em endpoints críticos de auth, cobrança ou onboarding
