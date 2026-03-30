---
title: Runbook de Cobrança
description: Procedimento operacional para checkout, webhook, conciliação e incidentes de cobrança.
---

# Runbook de Cobrança

Este runbook cobre o fluxo operacional da cobrança com Asaas no backend.

## Fluxo esperado

1. loja acessa a área de cobrança
2. backend gera checkout no Asaas
3. pagamento local recebe `providerPaymentId`
4. Asaas envia webhook
5. backend concilia status local
6. overview de configurações reflete saúde da cobrança

## Pré-check de prontidão

- `ASAAS_API_KEY` configurada
- `ASAAS_BASE_URL` coerente com o ambiente
- `ASAAS_WEBHOOK_URL` publicado externamente
- `ASAAS_WEBHOOK_TOKEN` configurado
- `ASAAS_WALLET_ID` definido quando a operação exigir carteira dedicada

## Endpoints principais

- `POST /api/SubscriptionPayments/shop/:shopId/subscription/:subscriptionId/checkout`
- `POST /api/SubscriptionPayments/:id/sync`
- `POST /api/Billing/webhooks/asaas`
- `GET /api/Settings/overview`

## Teste operacional mínimo

### Gerar checkout

- selecionar plano
- gerar cobrança no Asaas
- confirmar retorno de:
  - `invoiceUrl`
  - `providerPaymentId`
  - `pixCopyPaste` quando for Pix

### Conciliar webhook

- confirmar recebimento do evento
- validar atualização de:
  - `status`
  - `paidAt`
  - `invoiceUrl`
  - payload bruto do provedor

### Sincronização manual

- chamar `POST /api/SubscriptionPayments/:id/sync`
- conferir se o estado local converge com o Asaas

## Incidentes comuns

### Checkout não gera cobrança

- revisar `ASAAS_API_KEY`
- revisar `ASAAS_BASE_URL`
- confirmar dados mínimos da loja:
  - `name`
  - `email`
  - `cnpj` quando necessário

### Webhook não atualiza pagamento

- validar `ASAAS_WEBHOOK_TOKEN`
- conferir se o evento contém `id` ou `externalReference`
- checar logs do backend para `payment_not_found`

### Loja segue bloqueada mesmo após pagamento

- sincronizar pagamento manualmente
- revisar `status` consolidado no `SettingsService`
- confirmar se o pagamento cobre a data atual

## Operação diária

- monitorar pagamentos `overdue`
- revisar lojas com `trial_expired_without_active_plan`
- acompanhar falhas de comunicação com o provedor
- manter trilha mínima de auditoria para ações manuais
