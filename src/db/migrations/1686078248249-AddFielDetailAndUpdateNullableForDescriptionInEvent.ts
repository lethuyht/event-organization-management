import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFielDetailAndUpdateNullableForDescriptionInEvent1686078248249
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE event RENAME COLUMN description TO detail;
        ALTER TABLE event ADD  COLUMN description TEXT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` SELECT 1; `);
  }
}
