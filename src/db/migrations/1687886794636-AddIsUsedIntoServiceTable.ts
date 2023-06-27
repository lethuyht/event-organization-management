import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsUsedIntoServiceTable1687886794636
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service"
        ADD COLUMN IF NOT EXISTS "is_used" boolean DEFAULT FALSE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
