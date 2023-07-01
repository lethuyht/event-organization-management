import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeColumnIntoContractTable1687801620660
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE IF EXISTS "contract"
            ADD COLUMN IF NOT EXISTS "code" varchar(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
