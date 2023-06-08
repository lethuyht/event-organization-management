import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartTable1685761283931 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`   
            CREATE TABLE IF NOT EXISTS "cart" (
                "id"        uuid        NOT NULL        DEFAULT uuid_generate_v4(),
                "user_id"   uuid        NOT NULL,
                "created_at"    timestamp with time zone    DEFAULT now(),
                "updated_at"    timestamp with time zone    DEFAULT now(),
                CONSTRAINT "pk_cart_id" PRIMARY KEY("id"),
                CONSTRAINT "fk_cart_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "cart";
    `);
  }
}
