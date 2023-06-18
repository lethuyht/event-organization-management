import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContractEventTable1687070447434
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "contract_event" (
                "id"            uuid    NOT NULL    DEFAULT uuid_generate_v4(),
                "contract_id"   uuid    NOT NULL,
                "event_id"      uuid    NOT NULL,
                "created_at"    timestamp with time zone    DEFAULT now(),
                "updated_at"    timestamp with time zone    DEFAULT now(),
                CONSTRAINT "pk_contract_event_id"  PRIMARY KEY ("id"),
                CONSTRAINT "fk_contract_event_contract_id" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_contract_event_event_id"    FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "contract_event";
    `);
  }
}
