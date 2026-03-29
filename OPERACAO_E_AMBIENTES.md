# Operacao e Ambientes do Backend

## Objetivo

Centralizar como subir, operar e evoluir o backend do Auto Scan em desenvolvimento, homologacao e producao.

## Ambientes

### Desenvolvimento local

Objetivo:

- velocidade de iteracao
- validacao funcional rapida
- testes de integracao com frontend

Componentes:

- PostgreSQL via Docker Compose ou local
- backend NestJS
- frontend Angular local

### Homologacao

Objetivo:

- validar fluxo antes de publicar
- revisar integracoes
- testar dados e comportamento operacional

Recomendacoes:

- banco dedicado
- seeds controladas
- variaveis de ambiente separadas
- logs habilitados

### Producao

Objetivo:

- estabilidade
- rastreabilidade
- seguranca
- previsibilidade de deploy

Recomendacoes:

- migrations completas
- `synchronize` desligado
- backups e observabilidade
- segregacao de segredos
- politicas de acesso por ambiente

## Variaveis de ambiente

Arquivo base:

- [backend/.env.example](c:/Users/pfsou/Projetos/auto-scan/backend/.env.example)

Variaveis atuais:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INVENTORY_SYNC_RUN_ON_STARTUP`
- `DB_WAIT_MAX_ATTEMPTS`
- `DB_WAIT_DELAY_MS`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Fluxo local recomendado

### Opcao A: stack Docker completa

```bash
cd backend
docker compose up --build
```

Esse fluxo:

- sobe PostgreSQL
- cria o banco `auto_scan`
- espera o banco responder
- roda migrations
- compila e sobe a API

### Opcao B: backend local + banco local

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

### Opcional: popular dados de demo

```bash
npm run seed
```

## Swagger local

Com o backend rodando:

- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/docs-json`
- YAML: `http://localhost:3000/docs-yaml`

## Integracao de estoque

Documento operacional principal:

- [INTEGRACAO_ESTOQUE_E_OPERACAO.md](c:/Users/pfsou/Projetos/auto-scan/backend/INTEGRACAO_ESTOQUE_E_OPERACAO.md)

Rotas principais:

- `POST /api/InventorySync/shops/:shopId/run`
- `POST /api/InventorySync/run-enabled`
- `GET /api/InventorySync/shops/:shopId/status`

### Estrategia operacional

- agendar sincronizacao recorrente por loja
- permitir rerun manual para suporte
- manter status e erro da ultima sincronizacao
- desativar veiculos sumidos do feed em vez de apagar

## Seed e idempotencia

### Seeds permanentes de ambiente de demo

- admin principal
- loja demo
- veiculos de exemplo
- planos basicos

### Provisionamentos estruturantes por migration

- loja Kafka Multimarcas
- usuarios da Kafka
- campos de integracao que fazem parte do schema funcional

### Regra geral

- migration para estrutura e dados realmente obrigatorios
- seed para dados de conveniencia e demonstracao

## Estrategia recomendada de producao

### Banco

- desligar `synchronize`
- publicar schema somente via migrations
- versionar migrations junto do codigo
- executar migration no pipeline de deploy com trava de ordem

### Aplicacao

- build com `npm run build`
- start por `node dist/main.js`
- um processo por container ou instancia
- variaveis de ambiente injetadas no runtime

### Seguranca

- `JWT_SECRET` forte e exclusivo por ambiente
- `OPENAI_API_KEY` armazenada fora do repositorio
- CORS restrito aos dominios reais do frontend
- segredos em cofre ou secret manager
- rotas operacionais protegidas com JWT

### Observabilidade

- logs estruturados
- monitoramento de falha de cron
- alerta para falha de sincronizacao de estoque
- acompanhamento de erros do chat e da OpenAI

## Roadmap de endurecimento para producao

1. remover dependencia de `synchronize`
2. criar migrations adicionais para todas as entidades e indices
3. enriquecer seed idempotente de homologacao
4. adicionar testes de smoke no pipeline
5. configurar logs e health checks externos
6. adicionar rate limit para rotas publicas de chat
