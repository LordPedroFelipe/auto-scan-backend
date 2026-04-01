"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAiUpgrade1743320000000 = void 0;
class ChatAiUpgrade1743320000000 {
    constructor() {
        this.name = 'ChatAiUpgrade1743320000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionKey" varchar(120) NOT NULL UNIQUE,
        "shopId" uuid NULL,
        "vehicleId" uuid NULL,
        "leadId" uuid NULL,
        "customerProfile" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "summary" text NULL,
        "lastRecommendedVehicleIds" text[] NOT NULL DEFAULT '{}',
        "keywords" text[] NOT NULL DEFAULT '{}',
        "messagesCount" integer NOT NULL DEFAULT 0,
        "toolCallsCount" integer NOT NULL DEFAULT 0,
        "handoffsCount" integer NOT NULL DEFAULT 0,
        "lastCustomerMessageAt" timestamptz NULL,
        "lastAssistantMessageAt" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionId" uuid NOT NULL,
        "author" varchar(20) NOT NULL,
        "text" text NOT NULL,
        "metadata" jsonb NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_telemetry_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionId" uuid NOT NULL,
        "type" varchar(60) NOT NULL,
        "level" varchar(20) NOT NULL DEFAULT 'info',
        "message" text NOT NULL,
        "payload" jsonb NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_chat_message_session_created"
      ON "chat_messages" ("sessionId", "createdAt")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_chat_telemetry_session_created"
      ON "chat_telemetry_events" ("sessionId", "createdAt")
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_chat_messages_session'
        ) THEN
          ALTER TABLE "chat_messages"
          ADD CONSTRAINT "FK_chat_messages_session"
          FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id")
          ON DELETE CASCADE;
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_chat_telemetry_session'
        ) THEN
          ALTER TABLE "chat_telemetry_events"
          ADD CONSTRAINT "FK_chat_telemetry_session"
          FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id")
          ON DELETE CASCADE;
        END IF;
      END $$;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "chat_telemetry_events"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "chat_messages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "chat_sessions"`);
    }
}
exports.ChatAiUpgrade1743320000000 = ChatAiUpgrade1743320000000;
