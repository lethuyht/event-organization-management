import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSomeTable1685989389863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE IF EXISTS "cart_item"
            ADD COLUMN "hire_end_date" TIMESTAMP WITH TIME ZONE
    `);

    await queryRunner.query(`
        ALTER TABLE IF EXISTS "contract"
        ADD COLUMN "hire_end_date" TIMESTAMP WITH TIME ZONE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        SELECT '1';
    `);
  }
}
