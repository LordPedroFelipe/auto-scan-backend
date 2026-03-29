# Arquitetura do Backend

## Objetivo

Descrever a arquitetura atual do backend do Auto Scan, os modulos existentes, o papel de cada camada e o estado da reconstrucao.

## Stack

- NestJS
- TypeORM
- PostgreSQL
- JWT
- class-validator
- @nestjs/schedule
- OpenAI SDK

## Principios adotados

- reconstruir com foco no produto, nao no backend .NET perdido
- preservar contratos do frontend quando fizer sentido
- organizar por modulo de dominio
- priorizar execucao real e validacao continua
- documentar arquitetura e operacao junto com a implementacao

## Estrutura atual

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
      inventory-sync/
      lead-notes/
      leads/
      permissions/
      qrcode/
      reports/
      shops/
      subscriptions/
      test-drives/
      users/
      vehicles/
    scripts/
      run-migrations.ts
      seed.ts
      sync-inventory.ts
```

## Modulos do dominio

### Auth

Responsavel por:

- login
- registro
- emissao de JWT
- leitura do usuario autenticado

### Users

Responsavel por:

- CRUD de usuarios
- listagem resumida
- associacao com loja

### Permissions

Responsavel por:

- papeis
- claims
- modulos disponiveis

### Shops

Responsavel por:

- CRUD de lojas
- configuracoes da operacao
- vinculo com vendedores
- metadados de integracao de estoque

### Vehicles

Responsavel por:

- CRUD de veiculos
- filtros e paginacao
- integrações externas de estoque
- inativacao logica de itens importados

### Leads

Responsavel por:

- CRM comercial
- funil de status
- atribuicao a vendedor
- relacao com veiculo e loja

### LeadNotes

Responsavel por:

- historico adicional do lead
- anotacoes de operacao

### TestDrives

Responsavel por:

- agendamentos de test drive
- vinculo com lead e veiculo

### QRCode

Responsavel por:

- geracao e listagem de QR Codes por loja
- conexao entre patio fisico e atendimento digital

### Reports

Responsavel por:

- agregacoes operacionais por loja

### Subscriptions

Responsavel por:

- planos
- pagamentos
- dados basicos de assinatura

### InventorySync

Responsavel por:

- sincronizacao automatica de estoque por loja
- cron por loja
- status de ultima integracao
- provisionamento inicial da Kafka Multimarcas

### Chat

Responsavel por:

- sessao conversacional
- extracao de perfil do cliente
- recomendacao de veiculos
- criacao automatica de lead
- handoff para vendedor
- integracao opcional com OpenAI

## Camadas internas por modulo

Cada modulo tende a seguir esta organizacao:

- `controller`: contrato HTTP
- `service`: regra de negocio e orquestracao
- `dto`: payloads de entrada
- `entities`: mapeamento relacional TypeORM

## Banco de dados

### Estrategia atual

Hoje convivem duas abordagens:

- `synchronize: true` no bootstrap principal para acelerar retomada local
- migration runner dedicado para provisionar estrutura e dados criticos

Isso funciona bem para desenvolvimento rapido, mas nao e a estrategia final recomendada para producao.

### Estrategia alvo para producao

- remover dependencia de `synchronize`
- adotar migrations completas para schema e dados estruturantes
- manter seeds idempotentes so para dev, demo e homologacao

## Scripts operacionais

### Migrations

- `npm run migration:run`

### Seed

- `npm run seed`

### Sincronizacao de estoque

- `npm run inventory:sync`
- `npm run inventory:sync -- <shopId>`

## Integracao de estoque: Kafka Multimarcas

Ja provisionada no backend:

- loja com ID fixo
- usuario master
- vendedor
- feed remoto configurado
- cron padrao diario

O modulo de integracao:

- busca o feed JSON
- faz upsert por identificador externo do veiculo
- desativa itens ausentes no feed novo
- armazena payload original em `externalRaw`
- registra horario e status da ultima sincronizacao

## Chat IA

Resumo do desenho atual:

- memoria de sessao em memoria por `sessionId`
- parsing simples de perfil comercial
- busca no estoque real
- ranking por aderencia
- criacao automatica de lead
- opcionalmente reescreve a resposta com OpenAI

Documento dedicado:

- [AI_CHAT_ARCHITECTURE.md](c:\Users\pfsou\Projetos\auto-scan\auto-scan\backend\AI_CHAT_ARCHITECTURE.md)

## Swagger

A documentacao HTTP esta exposta em:

- `http://localhost:3000/api/docs`
- `http://localhost:3000/docs-json`
- `http://localhost:3000/docs-yaml`

Objetivo desta camada:

- facilitar inspecao de endpoints
- apoiar integracao com frontend
- acelerar testes manuais e onboarding tecnico

## Pontos fortes atuais

- backend funcional de ponta a ponta
- integracao real de estoque validada
- chat comercial funcional
- modulo por dominio organizado
- documentacao crescente dentro do proprio repositorio

## Dividas tecnicas conscientes

- persistencia do chat ainda nao esta em banco
- Swagger ainda pode evoluir com anotacoes mais ricas em DTOs e responses
- estrategia de banco ainda precisa convergir para migrations completas
- testes automatizados ainda sao limitados

## Proximos passos arquiteturais recomendados

1. persistir chat em banco
2. adicionar streaming no atendimento
3. enriquecer OpenAPI com schemas e seguranca por rota
4. consolidar producao sem `synchronize`
5. adicionar testes de integracao por modulo


