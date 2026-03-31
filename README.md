# Backend Auto Scan

Backend NestJS + TypeORM + PostgreSQL para a operacao do Auto Scan.

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
- `Sales`
- `Dashboard`
- `InventorySync`
- `Chat`
- `Email`
- `Settings`
- `Subscriptions`
- `Reports`

## Estado atual

O backend hoje ja cobre:

- autenticacao JWT
- operacao multi-loja
- estoque com sincronizacao externa
- QR automatico por veiculo
- CRM de leads
- test drives
- fechamento comercial de venda e nao venda
- dashboards por papel
- origem do lead
- logs e status de integracao

## Como rodar

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

## Endpoints principais

### Dashboard

- `GET /Dashboard/home`
- `GET /Dashboard/system`
- `GET /Dashboard/shop`
- `GET /Dashboard/seller`

### Leads

- `GET /Lead`
- `GET /Lead/:id`
- `POST /Lead`
- `PUT /Lead/:id`
- `DELETE /Lead/:id`
- `GET /Lead/status`

### Sales

- `GET /Sales`
- `GET /Sales/options`
- `GET /Sales/:id`
- `POST /Sales`
- `PUT /Sales/:id`
- `DELETE /Sales/:id`

### QRCode

- `GET /QRCode`
- `GET /QRCode/shop/:shopId`
- `GET /QRCode/vehicle/:vehicleId`
- `GET /QRCode/vehicle/:vehicleId/image`
- `GET /QRCode/:id/image`
- `POST /QRCode/shop/:shopId`

## Migrations relevantes

- integracao por loja
- logs de sincronizacao
- configuracao de request de feed
- fechamento de vendas
- origem do lead

## Destaques de negocio

### Integracao de estoque

- feed por loja com `GET` ou `POST`
- headers e body configuraveis
- base de imagem configuravel
- suporte a feeds com retorno inconsistente
- caso real da Mazzocatto tratado

### QR Code

- criado automaticamente na integracao
- criado automaticamente no cadastro manual
- criado automaticamente na edicao do veiculo
- acessivel por endpoint de veiculo

### Sales

- lead encerrado como `Sale` ou `NoSale`
- lead atualizado para `Won` ou `Lost`
- suporte a dados financeiros e comerciais completos

### Dashboard

- `system-admin`: saude, integracoes, SLA, rankings, vendas por loja
- `shop-admin`: operacao da loja, filtros comerciais, vendas por vendedor
- `seller`: tarefas, agenda, metas e resultados pessoais

## Melhorias recomendadas agora

1. auditoria de acoes criticas
2. historico de mudanca de status de lead
3. detalhe executivo de venda com trilha completa
4. webhooks e cobranca mais maduros
5. relatorios institucionais no backend
