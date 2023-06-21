import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterContractServiceItemTable1687364256338
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE IF EXISTS "contract_service_item"
            ADD COLUMN IF NOT EXISTS "hire_date" timestamp with time zone;

            ALTER TABLE IF EXISTS "contract_service_item"
            ADD COLUMN IF NOT EXISTS "hire_end_date" timestamp with time zone;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       SELECT 1
    `);
  }
}
