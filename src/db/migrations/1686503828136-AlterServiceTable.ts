import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterServiceTable1686503828136 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service"
        ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false;
    `);

    await queryRunner.query(`
    ALTER TABLE IF EXISTS "service_item"
    ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service"
        DROP COLUMN IF EXISTS "is_published"
    `);

    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service_item"
        DROP COLUMN IF EXISTS "is_published"
    `);
  }
}
