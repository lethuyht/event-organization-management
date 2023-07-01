import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceColumnIntoTableContractServiceItemAndContractEventServiceItem1688060860265
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "contract_service_item"
        ADD COLUMN IF NOT EXISTS "price" float8;  
    `);

    await queryRunner.query(`
        ALTER TABLE IF EXISTS "contract_event_service_item"
        ADD COLUMN IF NOT EXISTS "price" float8;  
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
