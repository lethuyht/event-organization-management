import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableCartItem1685761890693 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cart_item"(
                "id"                uuid        NOT NULL        DEFAULT uuid_generate_v4(),
                "cart_id"           uuid        NOT NULL,
                "service_item_id"   uuid        NOT NULL,
                "hire_date"         timestamp with time zone,
                "updated_at"        timestamp with time zone    DEFAULT now(),
                "created_at"        timestamp with time zone    DEFAULT now(),
                CONSTRAINT "pk_cart_item" PRIMARY KEY ("id"),
                CONSTRAINT "fk_cart_item_cart_id" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_cart_item_service_item_id" FOREIGN KEY ("service_item_id") REFERENCES "service_item"("id") ON DELETE CASCADE 
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "cart_item"
    `);
  }
}
