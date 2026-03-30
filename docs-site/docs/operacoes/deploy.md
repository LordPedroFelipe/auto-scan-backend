---
title: Deploy
description: Fluxo recomendado de deploy do backend para homologação e produção.
---

# Deploy

Este documento define o fluxo operacional recomendado para publicar o backend do Auto Scan com previsibilidade, rollback simples e dependência explícita de migrations.

## Pré-requisitos

- imagem ou artefato do backend gerado com `npm run build`
- banco do ambiente acessível
- variáveis de ambiente revisadas
- migrations versionadas no repositório
- credenciais externas válidas:
  - JWT
  - SMTP
  - Asaas
  - OpenAI

## Ordem recomendada

1. validar `npm run lint`
2. validar `npm run build`
3. revisar variáveis do ambiente alvo
4. executar backup do banco
5. publicar artefato da aplicação
6. executar `npm run migration:run`
7. subir a nova versão
8. validar healthcheck e Swagger
9. executar smoke test funcional

## Fluxo recomendado por ambiente

### Homologação

- publicar branch candidata
- aplicar migrations
- validar auth, onboarding, cobrança, estoque e chat
- testar webhook do Asaas e envio de email

### Produção

- congelar janela de deploy
- confirmar backup recente do banco
- aplicar migrations com ordem controlada
- subir nova versão do backend
- acompanhar logs por pelo menos 15 minutos
- validar os fluxos críticos com dados reais ou monitorados

## Estratégia de rollback

### Aplicação

- manter a versão anterior pronta para reativação rápida
- rollback de código deve ser separado de rollback de banco

### Banco

- preferir migrations aditivas e compatíveis com rollback
- quando houver alteração destrutiva, exigir backup validado antes do deploy
- rollback de schema deve ser planejado por migration `down` ou restauração controlada

## Smoke test pós-deploy

- `POST /api/Auth/login`
- `GET /api/Auth/me`
- `GET /api/Settings/overview`
- `GET /api/Subscriptions`
- `POST /api/SubscriptionPayments/shop/:shopId/subscription/:subscriptionId/checkout`
- `POST /api/Billing/webhooks/asaas`
- `GET /api/Vehicles`

## Critérios mínimos para considerar o deploy saudável

- API responde sem erro 5xx nos endpoints principais
- migrations executadas sem pendência
- autenticação funcionando
- cobrança gerando checkout no Asaas
- webhook conciliando status
- UI carregando overview de configurações e cobrança
