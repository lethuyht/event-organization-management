import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventRequestTable1686079366528 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "event_request"(
            "id"            uuid                        NOT NULL    DEFAULT uuid_generate_v4(),
            "event_id"      uuid                        NOT NULL,
            "user_id"       uuid                        NOT NULL,
            "status"        varchar(50)                 NOT NULL   DEFAULT 'DRAFT',
            "created_at"    timestamp with time zone    DEFAULT now(),
            "updated_at"    timestamp with time zone    DEFAULT now(),    
            CONSTRAINT "pk_event_request_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_event_request_event_id" FOREIGN KEY ("event_id") REFERENCES "event" ("id") ON DELETE CASCADE,
            CONSTRAINT "fk_event_request_user_id" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
        ) 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` SELECT 1; `);
  }
}
