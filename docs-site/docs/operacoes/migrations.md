---
title: Migrations
description: Como operar migrations com segurança no ciclo de desenvolvimento e produção.
---

# Migrations

O backend deve operar com `synchronize: false` e schema versionado exclusivamente por migrations.

## Princípios

- toda mudança de schema entra por migration
- migrations sobem junto com o código
- produção nunca deve depender de `synchronize`
- rollout e rollback precisam ser pensados no desenho da migration

## Comando oficial

```bash
npm run migration:run
```

## Quando executar

- ao subir ambiente local a partir de banco vazio
- antes de iniciar a nova versão em homologação
- durante o deploy de produção, em ordem controlada

## Boas práticas

- migrations pequenas e explícitas
- evitar misturar muitas responsabilidades em uma mesma migration
- preferir mudanças aditivas antes de remoções
- criar índices junto das novas colunas quando fizer sentido operacional
- revisar impacto em tabelas quentes como:
  - `shops`
  - `users`
  - `vehicles`
  - `subscription_payments`

## Migrations recentes importantes

- bootstrap técnico e dados base
- admin global da plataforma
- preferências por loja
- prontidão de cobrança para produção

## Checklist antes de rodar em produção

- backup do banco validado
- migration revisada por outro desenvolvedor quando houver risco
- janela de manutenção definida se houver alteração sensível
- compatibilidade entre versão nova e antiga considerada

## Falhas comuns

### Migration falha por coluna já existente

- revisar se o ambiente recebeu ajuste manual fora do fluxo versionado
- corrigir drift antes de seguir para próximos deploys

### Aplicação sobe sem schema esperado

- confirmar se `npm run migration:run` foi executado no ambiente correto
- validar `DB_DATABASE` e `DB_HOST`

### Rollback de aplicação quebra por schema novo

- evitar publicar código que dependa imediatamente de remoção destrutiva
- preferir estratégia em duas etapas: adicionar, migrar uso, remover depois
