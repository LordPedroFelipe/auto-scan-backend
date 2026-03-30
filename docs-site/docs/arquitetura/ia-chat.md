---
title: IA e Chat Comercial
description: Arquitetura do vendedor digital, tools, streaming e observabilidade.
---

# IA e Chat Comercial

O modulo de chat transforma o Auto Scan em um vendedor digital consultivo, com contexto real do estoque e capacidade de conduzir o cliente para a melhor proxima acao comercial.

## O que ja esta implementado

- persistencia de sessoes em `chat_sessions`
- persistencia de mensagens em `chat_messages`
- trilha de observabilidade em `chat_telemetry_events`
- endpoint principal `POST /api/Chat/send`
- streaming SSE em `GET /api/Chat/stream/:sessionId`
- extracao de perfil do cliente
- memoria resumida por sessao
- tool orchestration para `buscarVeiculos`, `registrarLead`, `agendarTestDrive` e `transferirParaVendedor`
- recomendacao de veiculos reais com scoring comercial
- simulacao inicial de financiamento
- suporte opcional a OpenAI Responses API
- fallback deterministico sem `OPENAI_API_KEY`

## Camadas da arquitetura

### Persistencia

Responsavel por estado duravel, historico e resumo da sessao.

Arquivos centrais:

- `src/modules/chat/entities/chat-session.entity.ts`
- `src/modules/chat/entities/chat-message.entity.ts`
- `src/modules/chat/entities/chat-telemetry-event.entity.ts`

### Orquestracao comercial

Responsavel por consolidar perfil do cliente, resolver contexto de loja, decidir tools e compor a resposta final.

Arquivo central:

- `src/modules/chat/chat.service.ts`

### Tools de dominio

- `buscarVeiculos`
- `registrarLead`
- `agendarTestDrive`
- `transferirParaVendedor`

O desenho permite dois modos:

- com OpenAI, a IA decide tools explicitamente
- sem OpenAI, o backend usa planner deterministico

## O que volta para o frontend

- texto principal
- opcoes rapidas estruturadas
- cards de veiculos com score e justificativa
- simulacao de financiamento quando houver contexto
- perfil extraido do cliente
- memoria resumida da sessao
- proxima melhor acao
- telemetria resumida

## Observabilidade

Endpoints atuais:

- `GET /api/Chat/stream/:sessionId`
- `GET /api/Chat/observability`

Eventos relevantes:

- `connected`
- `status`
- `tool`
- `reply.started`
- `reply.chunk`
- `reply.completed`
- `reset`

## Proximos passos naturais

1. conectar financiamento a regras ou parceiro real
2. proteger ainda mais a observabilidade por escopo e claims
3. cobrir o fluxo conversacional com testes automatizados
4. enriquecer streaming quando a resposta vier diretamente da OpenAI
