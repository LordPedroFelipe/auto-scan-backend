# Integracao de Estoque e Operacao do Backend

## Objetivo

Este documento centraliza:

- como subir o backend localmente
- como subir com Docker
- como funciona a integracao de estoque por loja
- como configurar novas lojas para sincronizacao
- o que foi implementado de importante no backend

## Visao geral

Hoje o backend do Auto Scan tem quatro blocos principais:

1. API NestJS modular
2. PostgreSQL como banco principal
3. sincronizacao de estoque por feed externo
4. modulo de IA comercial para atendimento e recomendacao

## O que ja foi implementado de importante

### Infra e execucao

- backend NestJS organizado por modulos de dominio
- PostgreSQL com TypeORM
- scripts de migration, seed e sincronizacao manual
- stack Docker com `backend + postgres`
- criacao automatica do banco `auto_scan` no container do Postgres
- espera automatica do banco antes de subir a API

### Estoque

- provisionamento inicial da loja Kafka Multimarcas por migration
- campos de integracao de estoque dentro de `shops`
- importacao de veiculos por feed JSON externo
- upsert por `shopId + externalVehicleId`
- desativacao logica de veiculos que saem do feed
- persistencia do payload bruto em `externalRaw`
- agendamento por cron por loja
- endpoint para rodar sincronizacao manual
- endpoint para consultar status por loja

### IA comercial

- persistencia de sessoes e mensagens do chat
- streaming SSE do chat
- telemetria e observabilidade da IA
- tools explicitas para:
  - `buscarVeiculos`
  - `registrarLead`
  - `agendarTestDrive`
  - `transferirParaVendedor`
- recomendacao de veiculos com scoring comercial
- simulacao inicial de financiamento
- memoria resumida por sessao

### Seguranca operacional

- endpoints operacionais do chat protegidos com JWT
- filtro por `shopId` para sessoes, mensagens, keywords, metricas e observabilidade

## Como subir localmente com Docker

Este e o caminho mais simples hoje.

### Pre-requisitos

- Docker Desktop rodando
- engine Linux ativa

### Passo a passo

No diretorio `backend`:

```bash
docker compose up --build
```

Isso sobe:

- `db`: PostgreSQL 16
- `backend`: API NestJS

### O que acontece automaticamente

1. o Postgres sobe
2. o banco `auto_scan` e criado automaticamente
3. o backend espera o banco ficar disponivel
4. o backend roda `migration:run`
5. o backend compila
6. o backend sobe na porta `3000`

### Endpoints locais

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- PostgreSQL: `localhost:5433`

### Comandos uteis

```bash
docker compose up --build
docker compose down
docker compose down -v
```

Ou pelos scripts:

```bash
npm run docker:up
npm run docker:down
npm run docker:down:volumes
```

## Como subir localmente sem Docker

Use este modo se voce quiser rodar banco fora do container.

### Pre-requisitos

- PostgreSQL local rodando
- banco `auto_scan` criado

### `.env`

Exemplo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=auto_scan
JWT_SECRET=auto-scan-local-secret
JWT_EXPIRES_IN=7d
INVENTORY_SYNC_RUN_ON_STARTUP=false
DB_WAIT_MAX_ATTEMPTS=30
DB_WAIT_DELAY_MS=2000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

### Passo a passo

```bash
npm install
npm run migration:run
npm run start:dev
```

Opcional:

```bash
npm run seed
```

## Integracao de estoque por loja

## Como funciona

Cada loja pode ter sua propria configuracao de feed e sincronizacao.

Campos usados na entidade `shops`:

- `inventoryFeedUrl`
- `inventorySourceCode`
- `inventorySyncCron`
- `inventorySyncEnabled`
- `inventoryLastSyncAt`
- `inventoryLastSyncStatus`
- `inventoryLastSyncError`

## Fluxo da sincronizacao

Quando uma sincronizacao roda:

1. o backend busca o feed JSON da loja
2. filtra registros ativos
3. tenta localizar veiculos ja importados pela chave externa
4. cria ou atualiza os veiculos
5. registra origem e payload bruto
6. marca como inativos os veiculos que nao vieram mais no feed
7. atualiza o status da ultima sincronizacao na loja

## Regras importantes

- o feed e lido por `fetch`
- a importacao usa `integrationSource`
- o identificador principal do item importado e `externalVehicleId`
- a unicidade da integracao e garantida por indice `shopId + externalVehicleId`
- veiculo removido do feed nao e apagado do banco, ele fica `isActive = false`

## Estrutura esperada do feed

Modelo principal:

- `cod_loja`
- `total`
- `veiculos[]`

Campos relevantes por veiculo:

- `cod_veiculo`
- `cod_importacao`
- `marca`
- `modelo`
- `versao`
- `combustivel`
- `cor`
- `ano`
- `valor`
- `valor_oferta`
- `km`
- `placa`
- `situacao`
- `cidade`
- `uf`
- `cambio`
- `estado`
- `fotos[]`

## Provisionamento inicial ja existente

A migration [1743300000000-KafkaBootstrap.ts](c:/Users/pfsou/Projetos/auto-scan/backend/src/database/migrations/1743300000000-KafkaBootstrap.ts) ja cria:

- loja `Kafka Multimarcas`
- usuario master da loja
- usuario vendedor da loja
- configuracao de feed
- cron padrao
- habilitacao da sincronizacao

Constantes principais:

- `KAFKA_MULTIMARCAS_SHOP_ID`
- `KAFKA_MULTIMARCAS_FEED_URL`
- `KAFKA_MULTIMARCAS_SOURCE_CODE`
- `KAFKA_MULTIMARCAS_SOURCE_NAME`
- `KAFKA_MULTIMARCAS_DEFAULT_CRON`

## Como configurar uma nova loja para sincronizar estoque

### Passo 1

Criar a loja via API ou banco.

### Passo 2

Preencher os campos de integracao:

- `inventoryFeedUrl`
- `inventorySourceCode`
- `inventorySyncCron`
- `inventorySyncEnabled = true`

### Passo 3

Garantir que o feed retorna JSON valido com a estrutura esperada.

### Passo 4

Rodar sincronizacao manual para validar:

```bash
npm run inventory:sync
```

Ou pela rota autenticada:

- `POST /api/InventorySync/shops/:shopId/run`

### Passo 5

Consultar status:

- `GET /api/InventorySync/shops/:shopId/status`

## Endpoints da integracao de estoque

Todos protegidos por JWT:

- `POST /api/InventorySync/shops/:shopId/run`
- `POST /api/InventorySync/run-enabled`
- `GET /api/InventorySync/shops/:shopId/status`

## Estrategia de agendamento

O bootstrap do modulo de estoque:

- carrega lojas com `inventorySyncEnabled = true`
- registra um cron por loja
- opcionalmente roda sincronizacao no startup

Variavel relacionada:

- `INVENTORY_SYNC_RUN_ON_STARTUP=true|false`

## Como testar a integracao de estoque localmente

### Caminho recomendado

1. subir o backend
2. abrir Swagger
3. autenticar
4. executar `POST /api/InventorySync/shops/:shopId/run`
5. validar os veiculos em `Vehicles`
6. validar o status da loja em `GET /api/InventorySync/shops/:shopId/status`

### Validacoes importantes

- veiculos criados
- veiculos atualizados
- fotos montadas corretamente
- `integrationSource` preenchido
- `externalRaw` salvo
- `inventoryLastSyncStatus = success`

## Frontend local integrado ao backend

No frontend Angular, o ambiente local aponta para:

- `http://localhost:3000/api`

Fluxo recomendado:

1. subir backend em `3000`
2. subir frontend em `4200`
3. logar no sistema
4. validar dashboard
5. validar estoque
6. validar chat IA com veiculos reais

## Observacoes de seguranca

- nao versionar `.env`
- nao colocar chave real da OpenAI em `.env.example`
- usar `JWT_SECRET` forte em ambientes reais
- restringir CORS em producao
- proteger rotas operacionais com JWT

## Roadmap recomendado a partir daqui

1. adicionar testes automatizados para `InventorySyncService`
2. mover `synchronize` para `false` tambem no bootstrap principal
3. adicionar retry e timeout configuravel no fetch do feed
4. registrar logs estruturados da sincronizacao
5. incluir observabilidade de estoque no dashboard administrativo

