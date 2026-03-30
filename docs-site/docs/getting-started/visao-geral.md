---
title: Visao Geral
description: Panorama funcional e tecnico do backend Auto Scan.
---

# Visao Geral

O backend do Auto Scan foi construido em NestJS com TypeORM e PostgreSQL para sustentar autenticacao, operacao comercial, sincronizacao de estoque, atendimento com IA, QR Codes, relatorios e cobranca.

## Stack principal

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

## Caracteristicas que ja posicionam o produto bem

- backend organizado por modulos de dominio
- autenticacao JWT com Swagger documentado
- sincronizacao de estoque por loja com status operacional
- atendimento digital com IA e persistencia de sessoes
- base de cobranca e assinatura com prontidao para Asaas
- camada de email para notificacoes e fluxos operacionais

## O que este backend resolve para o negocio

- centraliza operacao comercial de lojas
- aproxima estoque fisico, atendimento digital e CRM
- reduz divergencia operacional com importacao automatica de veiculos
- sustenta onboarding de lojas, usuarios e planos
- cria base para cobranca recorrente e rastreabilidade

## Leituras seguintes

- [Subindo o backend](./subindo-o-backend.md)
- [Visao arquitetural](../arquitetura/visao-arquitetural.md)
- [Swagger e contratos](../api/swagger-e-contratos.md)
