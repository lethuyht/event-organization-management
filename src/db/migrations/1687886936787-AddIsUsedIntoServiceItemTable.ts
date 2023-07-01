import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsUsedIntoServiceItemTable1687886936787
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service_item"
        ADD COLUMN IF NOT EXISTS "is_used" boolean DEFAULT FALSE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
