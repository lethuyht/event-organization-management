import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesColumnIntoServiceItem1686665381053
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "service_item"
        ADD COLUMN "images" text[]`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT 1`);
  }
}
