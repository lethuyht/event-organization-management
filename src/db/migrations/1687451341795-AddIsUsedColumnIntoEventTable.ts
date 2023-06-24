import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsUsedColumnIntoEventTable1687451341795
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "event"
        ADD COLUMN IF NOT EXISTS "is_used" BOOLEAN DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "event"
        DROP COLUMN IF EXISTS "is_used"
    `);
  }
}
