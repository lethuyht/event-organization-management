import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDetailColumnIntoServiceTable1686748117166
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service"
        ADD COLUMN IF NOT EXISTS "detail" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service"
        DROP COLUMN IF EXISTS "detail"
    `);
  }
}
