FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
COPY .env.example ./.env.example
COPY README.md ./README.md
COPY AI_CHAT_ARCHITECTURE.md ./AI_CHAT_ARCHITECTURE.md
COPY ARQUITETURA_BACKEND.md ./ARQUITETURA_BACKEND.md
COPY OPERACAO_E_AMBIENTES.md ./OPERACAO_E_AMBIENTES.md

EXPOSE 3000

CMD ["sh", "-c", "npm run wait:db && npm run migration:run && npm run build && npm run start"]
