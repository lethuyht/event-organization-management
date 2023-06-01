import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventTable1685642212967 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "event"(
            "id"            uuid                        NOT NULL    DEFAULT uuid_generate_v4(),
            "name"          varchar(255)                NOT NULL,
            "description"   text                        NOT NULL,
            "is_public"     boolean                     NOT NULL    DEFAULT FALSE,
            "created_at"    timestamp with time zone    DEFAULT now(),
            "updated_at"    timestamp with time zone    DEFAULT now(),    
            CONSTRAINT "pk_event_id" PRIMARY KEY ("id")
        ) 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "event"
    `);
  }
}
