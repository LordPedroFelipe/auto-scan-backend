---
title: Estoque e Operacao
description: Integracao por feed, sincronizacao por loja e validacoes operacionais.
---

# Estoque e Operacao

O backend possui uma integracao de estoque por loja pensada para reduzir divergencia entre o que esta no patio, o que aparece no digital e o que o time comercial usa para vender.

## O que ja foi implementado

- configuracao de feed por loja
- importacao de veiculos por JSON externo
- upsert por `shopId + externalVehicleId`
- desativacao logica de itens ausentes
- persistencia de payload bruto em `externalRaw`
- agendamento por cron por loja
- sincronizacao manual por endpoint autenticado
- consulta de status da ultima integracao

## Campos usados na loja

- `inventoryFeedUrl`
- `inventorySourceCode`
- `inventorySyncCron`
- `inventorySyncEnabled`
- `inventoryLastSyncAt`
- `inventoryLastSyncStatus`
- `inventoryLastSyncError`

## Fluxo da sincronizacao

1. o backend busca o feed JSON da loja
2. filtra registros ativos
3. localiza veiculos importados pela chave externa
4. cria ou atualiza os registros
5. salva origem e payload bruto
6. inativa o que deixou de existir no feed
7. atualiza o status da loja

## Regras importantes

- a integracao usa `externalVehicleId` como chave principal de reconciliacao
- a importacao preserva rastreabilidade de origem
- veiculo removido do feed nao e apagado; passa a `isActive = false`
- o status operacional da loja deve refletir sucesso ou erro da ultima execucao

## Endpoints principais

Todos protegidos por JWT:

- `POST /api/InventorySync/shops/:shopId/run`
- `POST /api/InventorySync/run-enabled`
- `GET /api/InventorySync/shops/:shopId/status`

## Provisionamento inicial

A migration `1743300000000-KafkaBootstrap.ts` ja provisiona uma loja de referencia com feed e cron padrao para acelerar validacao funcional.

## Validacao local recomendada

1. subir backend e banco
2. autenticar no Swagger
3. rodar `POST /api/InventorySync/shops/:shopId/run`
4. validar veiculos importados
5. consultar `GET /api/InventorySync/shops/:shopId/status`
6. revisar `integrationSource`, `externalRaw` e `inventoryLastSyncStatus`

## Proximos passos de maturidade

- retries e timeouts configuraveis no fetch
- logs estruturados por execucao
- alertas para falhas repetidas
- observabilidade de estoque em dashboard administrativo
