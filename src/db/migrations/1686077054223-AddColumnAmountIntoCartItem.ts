import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnAmountIntoCartItem1686077054223
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE IF EXISTS "cart_item"
            ADD COLUMN IF NOT EXISTS "amount" integer
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "cart_item"
        DROP COLUM IF EXISTS "amount"
    `);
  }
}
