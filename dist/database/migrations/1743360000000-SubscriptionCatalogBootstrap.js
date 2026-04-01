"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionCatalogBootstrap1743360000000 = void 0;
class SubscriptionCatalogBootstrap1743360000000 {
    constructor() {
        this.name = 'SubscriptionCatalogBootstrap1743360000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(120) NOT NULL,
        "slug" character varying(120),
        "code" character varying(60),
        "description" text,
        "price" numeric(12,2) NOT NULL DEFAULT 0,
        "durationInDays" integer NOT NULL DEFAULT 30,
        "qrCodeLimit" integer NOT NULL DEFAULT 0,
        "type" character varying(20) NOT NULL DEFAULT 'Monthly',
        "benefits" jsonb NOT NULL DEFAULT '[]',
        "marketingBadge" character varying(120),
        "displayOrder" integer NOT NULL DEFAULT 0,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "isPromotional" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscriptions_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "slug" character varying(120)`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "code" character varying(60)`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "benefits" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "marketingBadge" character varying(120)`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "displayOrder" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "isFeatured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "isPromotional" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`UPDATE "subscriptions" SET "displayOrder" = COALESCE("displayOrder", 0)`);
        await this.upsertPlan(queryRunner, {
            slug: 'plano-start-399',
            code: 'START_399',
            name: 'Plano Start 399',
            description: 'Para lojas que estão começando com operação enxuta e foco em tração comercial.',
            price: 399,
            durationInDays: 30,
            qrCodeLimit: 20,
            type: 'Monthly',
            benefits: [
                'Cadastro ou integração de até 20 veículos',
                'Painel de gestão de estoque',
                'Visualização via QR Code com dados da loja',
                'Atendimento com IA em nível inicial',
                'Agendamento de test drive',
                'Suporte por e-mail'
            ],
            marketingBadge: 'Entrada',
            displayOrder: 20,
            isFeatured: false,
            isPromotional: false,
            isActive: true,
        });
        await this.upsertPlan(queryRunner, {
            slug: 'plano-growth-599',
            code: 'GROWTH_599',
            name: 'Plano Growth 599',
            description: 'Para lojas com operação média e necessidade de mais inteligência comercial.',
            price: 599,
            durationInDays: 30,
            qrCodeLimit: 100,
            type: 'Monthly',
            benefits: [
                'Cadastro de até 100 veículos',
                'Visualização via QR Code',
                'IA com atendimento ao cliente',
                'Atendimento com histórico',
                'Painel avançado de leads',
                'Painel de gestão de estoque',
                'Suporte por e-mail'
            ],
            marketingBadge: 'Crescimento',
            displayOrder: 30,
            isFeatured: false,
            isPromotional: false,
            isActive: true,
        });
        await this.upsertPlan(queryRunner, {
            slug: 'plano-scale-799',
            code: 'SCALE_799',
            name: 'Plano Scale 799',
            description: 'Para lojas com operação mais madura, maior volume e necessidade de escala.',
            price: 799,
            durationInDays: 30,
            qrCodeLimit: 9999,
            type: 'Monthly',
            benefits: [
                'Cadastro ou integração ilimitada de veículos',
                'Painel de gestão de estoque',
                'QR Codes personalizados por veículo',
                'Visualização via QR Code com dados da loja',
                'IA com atendimento ao cliente',
                'Painel avançado de leads',
                'Captura de leads em múltiplos pontos',
                'Agendamento de test drive',
                'Dashboard com indicadores da loja',
                'Gerador de relatórios',
                'Suporte prioritário'
            ],
            marketingBadge: 'Mais completo',
            displayOrder: 40,
            isFeatured: true,
            isPromotional: false,
            isActive: true,
        });
        await this.upsertPlan(queryRunner, {
            slug: 'plano-lancamento-399',
            code: 'LAUNCH_399',
            name: 'Plano Lançamento 399',
            description: 'Oferta promocional de lançamento para as primeiras 200 lojas parceiras da plataforma.',
            price: 399,
            durationInDays: 30,
            qrCodeLimit: 50,
            type: 'Monthly',
            benefits: [
                'Condição especial de lançamento',
                'Entrada acelerada na plataforma',
                'Estoque, QR Codes e IA comercial em um único fluxo',
                'Onboarding comercial com foco em ativação rápida'
            ],
            marketingBadge: 'Primeiras 200 lojas',
            displayOrder: 10,
            isFeatured: false,
            isPromotional: true,
            isActive: true,
        });
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "subscriptions"
      WHERE "slug" IN (
        'plano-start-399',
        'plano-growth-599',
        'plano-scale-799',
        'plano-lancamento-399'
      )
    `);
    }
    async upsertPlan(queryRunner, plan) {
        const escapedBenefits = JSON.stringify(plan.benefits).replace(/'/g, "''");
        const escapedName = plan.name.replace(/'/g, "''");
        const escapedSlug = plan.slug.replace(/'/g, "''");
        const escapedCode = plan.code.replace(/'/g, "''");
        const escapedDescription = plan.description.replace(/'/g, "''");
        const escapedBadge = plan.marketingBadge.replace(/'/g, "''");
        await queryRunner.query(`
      UPDATE "subscriptions"
      SET
        "code" = '${escapedCode}',
        "name" = '${escapedName}',
        "description" = '${escapedDescription}',
        "price" = ${plan.price},
        "durationInDays" = ${plan.durationInDays},
        "qrCodeLimit" = ${plan.qrCodeLimit},
        "type" = '${plan.type}',
        "benefits" = '${escapedBenefits}'::jsonb,
        "marketingBadge" = '${escapedBadge}',
        "displayOrder" = ${plan.displayOrder},
        "isFeatured" = ${plan.isFeatured},
        "isPromotional" = ${plan.isPromotional},
        "isActive" = ${plan.isActive}
      WHERE "slug" = '${escapedSlug}'
    `);
        await queryRunner.query(`
      INSERT INTO "subscriptions" (
        "slug",
        "code",
        "name",
        "description",
        "price",
        "durationInDays",
        "qrCodeLimit",
        "type",
        "benefits",
        "marketingBadge",
        "displayOrder",
        "isFeatured",
        "isPromotional",
        "isActive"
      )
      SELECT
        '${escapedSlug}',
        '${escapedCode}',
        '${escapedName}',
        '${escapedDescription}',
        ${plan.price},
        ${plan.durationInDays},
        ${plan.qrCodeLimit},
        '${plan.type}',
        '${escapedBenefits}'::jsonb,
        '${escapedBadge}',
        ${plan.displayOrder},
        ${plan.isFeatured},
        ${plan.isPromotional},
        ${plan.isActive}
      WHERE NOT EXISTS (
        SELECT 1 FROM "subscriptions" WHERE "slug" = '${escapedSlug}'
      )
    `);
    }
}
exports.SubscriptionCatalogBootstrap1743360000000 = SubscriptionCatalogBootstrap1743360000000;
