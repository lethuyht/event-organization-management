import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContractEventServiceItemTanle1687072835631
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "contract_event_service_item" (
                "id"                uuid        NOT NULL        DEFAULT uuid_generate_v4(),
                "contract_event_id" uuid        NOT NULL,
                "service_item_id"   uuid        NOT NULL,
                "amount"            integer     NOT NULL    DEFAULT 1,
                "created_at"    timestamp with time zone    DEFAULT now(),
                "updated_at"    timestamp with time zone    DEFAULT now(),   
                CONSTRAINT "pk_contract_event_service_item_id"  PRIMARY KEY ("id"),
                CONSTRAINT "fk_contract_event_service_item_contract_event_id" FOREIGN KEY ("contract_event_id") REFERENCES "contract_event"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_contract_event_service_item_service_item_id" FOREIGN KEY ("service_item_id") REFERENCES "service_item"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "contract_event_service_item";
    `);
  }
}
