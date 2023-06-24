import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventServiceItemTable1687068402388
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "event_service_item"(
                "id"                uuid        NOT NULL    DEFAULT uuid_generate_v4(),
                "event_id"          uuid        NOT NULL,
                "service_item_id"   uuid        NOT NULL,
                "amount"            integer     NOT NULL    DEFAULT 1,
                "updated_at"        timestamp with time zone    DEFAULT now(),
                "created_at"        timestamp with time zone    DEFAULT now(),
                CONSTRAINT "event_service_item_id"  PRIMARY KEY ("id"),
                CONSTRAINT "event_service_item_service_item_id" FOREIGN KEY ("service_item_id") REFERENCES "service_item"("id") ON DELETE CASCADE,
                CONSTRAINT "event_service_item_event_id" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE
            )    
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "event_service_item"
    `);
  }
}
