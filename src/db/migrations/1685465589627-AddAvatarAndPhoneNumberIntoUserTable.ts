import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarAndPhoneNumberIntoUserTable1685465589627
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS "avatar" varchar  NULL,
            ADD COLUMN IF NOT EXISTS "phone_number" varchar  NULL;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT 1;`);
  }
}
