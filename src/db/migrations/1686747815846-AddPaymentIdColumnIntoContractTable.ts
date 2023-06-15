import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentIdColumnIntoContractTable1686747815846
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "contract"
        ADD COLUMN IF NOT EXISTS "payment_intent_id" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS "contract"
        DROP COLUMN IF EXISTS "payment_intent_id"
    `);
  }
}
