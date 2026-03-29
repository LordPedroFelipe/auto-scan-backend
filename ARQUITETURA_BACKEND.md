# Arquitetura do Backend

## Objetivo

Descrever a arquitetura atual do backend do Auto Scan, os modulos existentes, o papel de cada camada e o estado atual da implementacao.

## Stack

- NestJS
- TypeORM
- PostgreSQL
- JWT
- class-validator
- @nestjs/schedule
- OpenAI SDK
- Docker Compose

## Principios adotados

- reconstruir com foco no produto
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
      wait-for-db.ts
  Dockerfile
  docker-compose.yml
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
- integracao com estoque externo
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
- status da ultima integracao
- provisionamento inicial da Kafka Multimarcas

### Chat

Responsavel por:

- sessao conversacional persistida
- streaming SSE
- extracao de perfil do cliente
- recomendacao de veiculos com scoring comercial
- criacao automatica de lead
- handoff para vendedor
- simulacao inicial de financiamento
- telemetria e observabilidade
- integracao opcional com OpenAI

## Camadas internas por modulo

Cada modulo tende a seguir esta organizacao:

- `controller`: contrato HTTP
- `service`: regra de negocio e orquestracao
- `dto`: payloads de entrada
- `entities`: mapeamento relacional TypeORM

## Banco de dados

### Estrategia atual

Hoje coexistem duas abordagens:

- `synchronize: true` no bootstrap principal para acelerar desenvolvimento
- migration runner dedicado para schema e dados estruturantes

Isso funciona para dev, mas o alvo de producao e migrar tudo para migrations.

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

### Espera do banco

- `npm run wait:db`

### Docker

- `npm run docker:up`
- `npm run docker:down`
- `npm run docker:down:volumes`

## Integracao de estoque

Resumo do desenho atual:

- cada loja pode ter feed proprio
- sincronizacao pode rodar por cron ou manualmente
- veiculos sao importados com chave externa por loja
- itens ausentes do feed sao desativados, nao apagados
- payload bruto fica salvo para rastreabilidade

Documento dedicado:

- [INTEGRACAO_ESTOQUE_E_OPERACAO.md](c:/Users/pfsou/Projetos/auto-scan/backend/INTEGRACAO_ESTOQUE_E_OPERACAO.md)

## Chat IA

Resumo do desenho atual:

- sessoes persistidas em banco
- mensagens persistidas em banco
- memoria resumida por sessao
- busca no estoque real
- ranking por aderencia comercial
- criacao automatica de lead
- tools explicitas do dominio
- streaming SSE
- observabilidade por eventos
- opcionalmente reescreve a resposta com OpenAI

Documento dedicado:

- [AI_CHAT_ARCHITECTURE.md](c:/Users/pfsou/Projetos/auto-scan/backend/AI_CHAT_ARCHITECTURE.md)

## Swagger

Documentacao HTTP exposta em:

- `http://localhost:3000/api/docs`
- `http://localhost:3000/docs-json`
- `http://localhost:3000/docs-yaml`

## Pontos fortes atuais

- backend funcional de ponta a ponta
- integracao real de estoque validada
- chat comercial funcional
- modulo por dominio organizado
- stack Docker pronta para dev
- documentacao centralizada dentro do repositorio

## Dividas tecnicas conscientes

- bootstrap principal ainda usa `synchronize`
- Swagger ainda pode evoluir com schemas mais ricos
- testes automatizados ainda sao limitados
- integracao de estoque ainda pode ganhar retries e timeouts mais sofisticados

## Proximos passos arquiteturais recomendados

1. consolidar producao sem `synchronize`
2. enriquecer OpenAPI com schemas e seguranca por rota
3. adicionar testes de integracao por modulo
4. ampliar observabilidade da sincronizacao de estoque
5. conectar simulacao de financiamento a regras reais
