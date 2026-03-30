---
id: intro
title: Introducao
slug: /intro
description: Portal central da documentacao do backend Auto Scan.
---

# Introducao

Este portal consolida a documentacao tecnica e operacional do backend do Auto Scan em um formato mais consistente para desenvolvimento, onboarding e evolucao do produto.

## O que voce encontra aqui

- visao geral do backend e dos modulos atuais
- arquitetura por dominio e dividas tecnicas conscientes
- operacao local, Docker, migrations e runbooks
- integracoes de estoque, IA, cobranca e comunicacao
- mapa do Swagger e orientacoes de contrato da API

## Direcao do projeto

O backend foi estruturado para suportar operacao real de lojas, atendimento digital assistido por IA, sincronizacao de estoque por feed externo, gestao comercial e cobranca.

O foco desta documentacao nao e somente explicar o codigo. O objetivo e deixar claro:

- como o sistema sobe
- como os modulos se relacionam
- quais integracoes existem hoje
- onde estao os riscos e proximos passos naturais

## Trilha recomendada

1. Leia [Visao Geral](./getting-started/visao-geral.md) para entender o produto e o escopo tecnico.
2. Siga por [Subindo o backend](./getting-started/subindo-o-backend.md) para preparar o ambiente local.
3. Consulte [Visao arquitetural](./arquitetura/visao-arquitetural.md) para navegar o backend por dominio.
4. Use [Runbook operacional](./operacoes/runbook-operacional.md) como guia de suporte e validacao.

## Referencias externas importantes

- Swagger UI local: `http://localhost:3000/api/docs`
- OpenAPI JSON local: `http://localhost:3000/docs-json`
- OpenAPI YAML local: `http://localhost:3000/docs-yaml`
