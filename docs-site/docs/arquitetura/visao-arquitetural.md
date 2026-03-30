---
title: Visao Arquitetural
description: Estrutura atual do backend, modulos de dominio e direcao arquitetural.
---

# Visao Arquitetural

O backend segue uma organizacao por modulos de dominio para manter contratos HTTP, regra de negocio e persistencia proximos do contexto funcional correspondente.

## Estrutura base

```text
backend/
  src/
    app.module.ts
    main.ts
    database/
      data-source.ts
      migrations/
    modules/
      auth/
      chat/
      email/
      inventory-sync/
      lead-notes/
      leads/
      permissions/
      qrcode/
      reports/
      settings/
      shops/
      subscriptions/
      test-drives/
      users/
      vehicles/
    scripts/
      run-migrations.ts
      seed.ts
      sync-inventory.ts
      wait-for-db.ts
```

## Camadas internas por modulo

Cada modulo tende a organizar:

- `controller`: contrato HTTP
- `service`: regra de negocio e orquestracao
- `dto`: payloads de entrada
- `entities`: mapeamento relacional TypeORM

## Responsabilidade dos modulos

### Core operacional

- `Auth`: login, registro e emissao de JWT
- `Users`: CRUD de usuarios e associacao com loja
- `Permissions`: papeis, claims e modulos disponiveis
- `Shops`: operacao da loja, configuracoes e integracoes
- `Settings`: overview executivo de configuracao, cobranca e prontidao

### Comercial

- `Vehicles`: estoque, filtros, integracao e inativacao logica
- `Leads`: CRM comercial e funil de atendimento
- `LeadNotes`: historico adicional do lead
- `TestDrives`: agendamentos e vinculos comerciais
- `QrCode`: ponte entre patio fisico e atendimento digital
- `Reports`: agregacoes operacionais por loja

### Plataformas e integracoes

- `Subscriptions`: planos, pagamentos e assinatura
- `InventorySync`: sincronizacao automatica de estoque por loja
- `Chat`: vendedor digital, SSE, scoring e handoff comercial
- `Email`: notificacoes por SMTP e envio operacional

## Banco de dados

### Estrategia atual

Hoje coexistem duas abordagens:

- `synchronize: true` no bootstrap principal para dev
- migrations dedicadas para schema e dados estruturantes

### Estrategia alvo para producao

- desligar `synchronize`
- operar schema somente via migrations
- manter seeds idempotentes apenas para dev, demo e homologacao

## Pontos fortes atuais

- backend funcional de ponta a ponta
- sincronizacao de estoque validada em operacao real
- chat comercial com persistencia, tool orchestration e observabilidade
- Swagger mais consistente e contratos mais claros
- documentacao agora centralizada em um portal navegavel

## Dividas tecnicas conscientes

- consolidar producao sem `synchronize`
- ampliar testes automatizados por modulo
- aprofundar enforcement de autorizacao no backend
- evoluir integracao de cobranca do status interno para fluxo real com webhooks

## Leitura complementar

- [Arquitetura do chat IA](./ia-chat.md)
- [Ambientes e execucao](../operacoes/ambientes-e-execucao.md)
