import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTokenTable1685262328698 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "token" (
            "id"                uuid        NOT NULL       DEFAULT uuid_generate_v4(),
            "user_id"           uuid        NOT NULL,
            "access_token"      varchar,
            "refresh_token"     varchar,
            "email"             varchar(255)    NOT NULL,
            "last_used"         timestamp with time zone    DEFAULT now()
        ) 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "token"
    `);
  }
}
