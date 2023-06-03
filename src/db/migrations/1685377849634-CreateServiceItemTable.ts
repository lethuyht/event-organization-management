import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceItemTable1685377849634 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service_item" (
                "id"                uuid        NOT NULL        DEFAULT uuid_generate_v4(),
                "name"              varchar     NOT NULL,
                "description"       varchar,
                "price"             float8      NOT NULL        DEFAULT 0,
                "total_quantity"    integer     NOT NULL        DEFAULT 0,
                "service_id"        uuid        NOT NULL,
                "updated_at"        timestamp with time zone    DEFAULT now(),
                "created_at"        timestamp with time zone    DEFAULT now(),
                CONSTRAINT "pk_service_item_id" PRIMARY KEY ("id"),
                CONSTRAINT "fk_service_item_service_id" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "service_item"
    `);
  }
}
