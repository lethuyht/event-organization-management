import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExtension1685261448135 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        SELECT '1'
    `);
  }
}
