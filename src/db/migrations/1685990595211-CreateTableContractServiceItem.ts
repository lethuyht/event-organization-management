import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableContractServiceItem1685990595211
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "contract_service_item" (
                "id"                uuid        NOT NULL        DEFAULT uuid_generate_v4(),
                "contract_id"       uuid        NOT NULL,
                "service_item_id"   uuid        NOT NULL,
                "amount"            integer     NOT NULL    DEFAULT 1,
                CONSTRAINT "pk_contract_service_item_id"  PRIMARY KEY ("id"),
                CONSTRAINT "fk_contract_service_item_contract_id" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_contract_service_item_service_item_id" FOREIGN KEY ("service_item_id") REFERENCES "service_item"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "contract_service_item";
    `);
  }
}
