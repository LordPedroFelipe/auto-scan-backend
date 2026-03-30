---
title: Cobranca e Comunicacao
description: Prontidao de Asaas, assinatura e camada de email do backend.
---

# Cobranca e Comunicacao

O backend ja possui base funcional para assinatura e pagamentos, alem de uma camada de comunicacao por email preparada para operacao real.

## Cobranca

### O que existe hoje

- modulo `Subscriptions` com planos, pagamentos e dados de assinatura
- modulo `Settings` com leitura executiva da saude de cobranca
- prontidao de provedor baseada em configuracao do Asaas
- contratos documentados no Swagger

### Variaveis ligadas ao Asaas

- `ASAAS_API_KEY`
- `ASAAS_ENV`
- `ASAAS_BASE_URL`
- `ASAAS_WEBHOOK_URL`
- `ASAAS_WALLET_ID`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_TIMEOUT_MS`

### Leitura de prontidao

O `SettingsService` avalia:

- se a chave do provedor esta configurada
- se a base URL esta coerente com o ambiente
- se webhook esta definido
- se wallet esta configurada

Isso permite transformar a tela de configuracao em um cockpit mais executivo e reduzir falsas sensacoes de que a cobranca ja esta pronta quando ainda faltam conectores operacionais.

### Operacao recomendada

- gerar checkout pelo backend
- receber webhook do Asaas
- sincronizar pagamento manualmente quando necessario
- usar o overview de configuracoes para identificar lojas sem cobertura valida

Para a trilha operacional detalhada, consulte o [Runbook de Cobranca](../operacoes/runbook-de-cobranca.md).

## Comunicacao por email

### O que existe hoje

- `EmailModule`
- `EmailService` com `nodemailer`
- fallback controlado quando SMTP nao esta configurado

### Variaveis usadas

- `MAIL_FROM_NAME`
- `MAIL_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`

### Boa pratica operacional

- separar remetentes por ambiente quando necessario
- evitar credenciais SMTP no repositorio
- validar envio real em homologacao antes de ativar automacoes
