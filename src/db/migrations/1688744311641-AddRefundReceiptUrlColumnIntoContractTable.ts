import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefundReceiptUrlColumnIntoContractTable1688744311641
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE IF EXISTS "contract"
            ADD COLUMN IF NOT EXISTS "refund_receipt_url" varchar
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE IF EXISTS "contract"
            DROP COLUMN "refund_receipt_url" 
        `);
  }
}
