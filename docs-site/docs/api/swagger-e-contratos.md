---
title: Swagger e Contratos
description: Como a API esta documentada e onde consultar os contratos do backend.
---

# Swagger e Contratos

O backend expoe a documentacao HTTP via Swagger/OpenAPI para facilitar consumo, testes e alinhamento entre frontend, backend e integracoes externas.

## Endpoints locais

- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/docs-json`
- YAML: `http://localhost:3000/docs-yaml`

## O que foi melhorado

- titulo e descricao mais alinhados ao produto
- `Bearer JWT` documentado
- ordenacao de tags e operacoes
- controllers com tags e operacoes mais consistentes
- DTOs com exemplos e tipos melhores no schema

## Como usar no dia a dia

### Desenvolvimento

- validar rapidamente payloads
- conferir DTOs antes de mexer em frontend
- testar autenticacao e rotas protegidas

### Integracao

- usar `docs-json` para gerar clientes ou validadores
- revisar naming e exemplos antes de expor novas rotas
- garantir coerencia entre DTO, regra de negocio e doc

## Regra de ouro para evolucao

Sempre que uma rota mudar, a documentacao precisa mudar junto. Em um projeto senior, Swagger nao e enfeite: ele e parte do contrato operacional do sistema.

## Melhorias naturais seguintes

1. padronizar envelopes de sucesso e erro
2. explicitar schemas de paginacao
3. documentar respostas por status code com mais profundidade
4. alinhar autorizacao por claims com anotacoes de rota
