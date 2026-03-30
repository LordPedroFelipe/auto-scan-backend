---
title: Ambientes e Execucao
description: Como operar o backend em desenvolvimento, homologacao e producao.
---

# Ambientes e Execucao

Esta secao centraliza como subir, operar e endurecer o backend do Auto Scan ao longo dos ambientes.

## Desenvolvimento local

Objetivos principais:

- velocidade de iteracao
- validacao funcional rapida
- testes integrados com o frontend

Componentes tipicos:

- PostgreSQL via Docker Compose ou local
- backend NestJS
- frontend Angular local

## Homologacao

Objetivo:

- validar fluxos antes de publicar
- revisar integracoes
- testar comportamento operacional com dados controlados

Recomendacoes:

- banco dedicado
- variaveis separadas por ambiente
- seeds controladas
- logs mais detalhados

## Producao

Objetivo:

- estabilidade
- rastreabilidade
- seguranca
- previsibilidade de deploy

Recomendacoes:

- migrations completas
- `synchronize` desligado
- backups
- observabilidade
- segregacao de segredos
- politicas de acesso por ambiente

## Estrategia recomendada de producao

### Banco

- publicar schema somente via migrations
- versionar migrations junto do codigo
- executar migrations no pipeline com ordem controlada

### Aplicacao

- build com `npm run build`
- start por `node dist/main.js`
- um processo por container ou instancia
- segredos injetados no runtime
- `synchronize` desligado com operacao 100% por migrations

### Seguranca

- `JWT_SECRET` forte e exclusivo por ambiente
- `OPENAI_API_KEY` fora do repositorio
- CORS restrito aos dominios reais
- rotas operacionais protegidas por JWT e, idealmente, claims

### Observabilidade

- logs estruturados
- monitoramento de falha de cron
- alerta para falha de sincronizacao
- acompanhamento de erros do chat e integracoes externas

## Documentos operacionais complementares

- [Deploy](./deploy.md)
- [Variáveis de Ambiente](./variaveis-de-ambiente.md)
- [Migrations](./migrations.md)
- [Runbook de Cobrança](./runbook-de-cobranca.md)
- [Troubleshooting](./troubleshooting.md)
