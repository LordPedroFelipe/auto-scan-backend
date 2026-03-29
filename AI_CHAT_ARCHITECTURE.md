# IA do AutoScan no Backend

## Objetivo

Transformar o chat do AutoScan em um vendedor digital consultivo, com contexto real do estoque e conducao comercial.

## O que esta implementado agora

- persistencia de sessoes em `chat_sessions`
- persistencia de mensagens em `chat_messages`
- trilha de observabilidade em `chat_telemetry_events`
- endpoint principal `POST /api/Chat/send`
- streaming SSE em `GET /api/Chat/stream/:sessionId`
- extracao de perfil do cliente a partir da conversa
- memoria resumida por sessao
- tool orchestration explicita para `buscarVeiculos`, `registrarLead`, `agendarTestDrive` e `transferirParaVendedor`
- busca de veiculos reais no banco com scoring comercial mais sofisticado
- simulacao inicial de financiamento orientada pelo veiculo recomendado
- captura automatica de lead quando a conversa amadurece
- handoff para vendedor da loja
- painel de observabilidade via `GET /api/Chat/observability`
- suporte opcional a OpenAI Responses API para refinar a resposta final e decidir ferramentas
- fallback deterministico quando `OPENAI_API_KEY` nao estiver configurada

## Camadas da arquitetura

### 1. Persistencia de conversa

Arquivos principais:

- `backend/src/modules/chat/entities/chat-session.entity.ts`
- `backend/src/modules/chat/entities/chat-message.entity.ts`
- `backend/src/modules/chat/entities/chat-telemetry-event.entity.ts`

Responsabilidades:

- manter estado duravel da sessao
- registrar historico completo de mensagens
- armazenar resumo, keywords, handoffs e contagem de tools

### 2. Orquestracao comercial

Arquivo principal:

- `backend/src/modules/chat/chat.service.ts`

Responsabilidades:

- consolidar perfil do cliente
- resolver contexto de loja e veiculo
- decidir tools necessarias
- construir resposta deterministica e opcionalmente enriquecer com OpenAI

### 3. Tool calling de dominio

Tools disponiveis:

- `buscarVeiculos`
- `registrarLead`
- `agendarTestDrive`
- `transferirParaVendedor`

Comportamento:

- com OpenAI: a IA pode escolher tools explicitamente pela Responses API
- sem OpenAI: o backend usa um planner deterministico para as mesmas tools

### 4. Recomendacao e financiamento

A recomendacao considera:

- faixa de orcamento
- marca, categoria, combustivel e cambio
- uso principal
- contexto por placa ou veiculo
- destaque, oferta e quilometragem
- aderencia comercial para financiamento

Resultado retornado ao front:

- texto principal
- opcoes rapidas estruturadas
- cards de veiculos com score e motivos
- simulacao de financiamento quando aplicavel
- perfil extraido
- resumo de memoria da sessao
- proxima acao sugerida

### 5. Streaming e observabilidade

Novos endpoints:

- `GET /api/Chat/stream/:sessionId`
- `GET /api/Chat/observability`

Eventos de streaming:

- `connected`
- `status`
- `tool`
- `reply.started`
- `reply.chunk`
- `reply.completed`
- `reset`

Observabilidade exposta:

- volume de sessoes e mensagens
- eventos de telemetria
- tools mais usadas
- eventos recentes da IA
- handoffs e test drives gerados

## Contrato atual do endpoint

Exemplo de request:

```json
{
  "sessionId": "sessao-123",
  "shopId": "b8c7f39e-6d23-4a42-89c6-44c9d44d1750",
  "message": "Quero um SUV ate 100 mil, automatico e economico",
  "plate": "QLB3G33",
  "customerName": "Paulo",
  "customerPhone": "47996440035"
}
```

Exemplo de resposta:

```json
{
  "id": "...",
  "message": "...",
  "options": [
    { "label": "Ver mais opcoes", "kind": "prompt", "action": "ver_mais_opcoes" }
  ],
  "photos": ["https://..."],
  "humor": "happy",
  "vehicles": [],
  "lead": null,
  "profile": {},
  "summary": "...",
  "financing": null,
  "handoffSuggested": false,
  "shouldCaptureLead": true,
  "nextBestAction": "capturar_lead",
  "telemetry": {
    "toolsUsed": ["buscarVeiculos"],
    "scoringVersion": "v2-weighted-commercial-score",
    "summaryVersion": "v1-compressed-session-summary",
    "responseMode": "streaming"
  }
}
```

## Proximos passos naturais

1. acoplar simulacao de financiamento a uma politica ou banco real
2. incluir autenticacao e filtros por loja no endpoint de observabilidade
3. enriquecer o streaming com tokens reais quando a resposta for gerada diretamente pela OpenAI
4. criar testes automatizados do fluxo conversacional e das tools
