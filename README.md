# Backend Auto Scan

Backend em NestJS + TypeORM + PostgreSQL para reconstruir e evoluir a API do Auto Scan.

## Stack

- NestJS
- TypeORM
- PostgreSQL
- JWT
- class-validator
- @nestjs/schedule
- OpenAI SDK
- Swagger/OpenAPI

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

## Como rodar

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

API:

- `http://localhost:3000/api`

Swagger:

- `http://localhost:3000/api/docs`
- `http://localhost:3000/docs-json`
- `http://localhost:3000/docs-yaml`

## Documentacao do backend

- [AI_CHAT_ARCHITECTURE.md](c:\Users\pfsou\Projetos\auto-scan\auto-scan\backend\AI_CHAT_ARCHITECTURE.md)
- [ARQUITETURA_BACKEND.md](c:\Users\pfsou\Projetos\auto-scan\auto-scan\backend\ARQUITETURA_BACKEND.md)
- [OPERACAO_E_AMBIENTES.md](c:\Users\pfsou\Projetos\auto-scan\auto-scan\backend\OPERACAO_E_AMBIENTES.md)

## Variaveis de ambiente

Arquivo base:

- [backend/.env.example](c:\Users\pfsou\Projetos\auto-scan\auto-scan\backend\.env.example)

Campos atuais:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INVENTORY_SYNC_RUN_ON_STARTUP`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Integracao de estoque

Ja existe uma integracao operacional para a Kafka Multimarcas.

Resumo:

- migration provisiona loja e usuarios
- feed remoto configurado por loja
- cron por expressao `inventorySyncCron`
- rerun sem duplicidade
- status da ultima execucao salvo na loja

Comando manual:

```bash
cd backend
npm run inventory:sync
```

## Chat IA

O backend ja possui uma base real de vendedor digital.

Hoje ele faz:

- extracao de perfil do cliente
- matching com estoque real
- recomendacao de veiculos
- criacao automatica de lead
- handoff para vendedor
- suporte opcional a OpenAI Responses API

## Validacoes importantes ja realizadas

- build do backend validado
- PostgreSQL local validado
- migration aplicada com sucesso
- sincronizacao real da Kafka validada
- chat comercial validado com recomendacao real por orcamento
- chat validado com contexto por placa
- lead automatico validado com atribuicao de vendedor

## Estado atual

O backend ja e suficiente para desenvolvimento real e validacao funcional com o frontend.

As proximas evolucoes mais valiosas sao:

1. persistir historico do chat
2. adicionar streaming
3. enriquecer OpenAPI com schemas mais completos
4. migrar para estrategia de producao sem `synchronize`
5. ampliar testes automatizados

