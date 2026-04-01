import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSalesGoalsTable1775010511176 implements MigrationInterface {
    name = 'CreateSalesGoalsTable1775010511176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "sales_goals_type_enum" AS ENUM('ShopMonthly', 'SellerMonthly', 'Campaign')
        `);

        await queryRunner.query(`
            CREATE TABLE "sales_goals" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "shopId" uuid NOT NULL,
                "sellerId" uuid,
                "campaignId" uuid,
                "type" "sales_goals_type_enum" NOT NULL,
                "year" integer NOT NULL,
                "month" integer NOT NULL,
                "campaignName" varchar(100),
                "targetValue" numeric(12,2) NOT NULL,
                "currentValue" numeric(12,2) NOT NULL DEFAULT '0',
                "startDate" date,
                "endDate" date,
                "isActive" boolean NOT NULL DEFAULT true,
                "description" text,
                "metadata" jsonb NOT NULL DEFAULT '{}',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sales_goals" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_sales_goal_shop_year_month" ON "sales_goals" ("shopId", "year", "month")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_sales_goal_seller_year_month" ON "sales_goals" ("sellerId", "year", "month")
        `);

        await queryRunner.query(`
            ALTER TABLE "sales_goals"
            ADD CONSTRAINT "FK_sales_goals_shop" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "sales_goals"
            ADD CONSTRAINT "FK_sales_goals_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_goals" DROP CONSTRAINT "FK_sales_goals_seller"`);
        await queryRunner.query(`ALTER TABLE "sales_goals" DROP CONSTRAINT "FK_sales_goals_shop"`);
        await queryRunner.query(`DROP INDEX "IDX_sales_goal_seller_year_month"`);
        await queryRunner.query(`DROP INDEX "IDX_sales_goal_shop_year_month"`);
        await queryRunner.query(`DROP TABLE "sales_goals"`);
        await queryRunner.query(`DROP TYPE "sales_goals_type_enum"`);
    }

}
