import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThumnailToEventTable1685778651047
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "event" ADD COLUMN "thumbnail" text  NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT 1;`);
  }
}
