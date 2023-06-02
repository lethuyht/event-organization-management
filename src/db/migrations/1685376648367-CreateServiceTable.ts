import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceTable1685376648367 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service"(
                "id"            uuid            NOT NULL    DEFAULT uuid_generate_v4(),
                "images"        text[]         NOT NULL,
                "name"          varchar(255)    NOT NULL,
                "description"   varchar,
                "type"          varchar(255),
                "created_at"    timestamp with time zone    DEFAULT now(),
                "updated_at"    timestamp with time zone    DEFAULT now(),
                CONSTRAINT "pk_service_id"  PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "service"
    `);
  }
}
