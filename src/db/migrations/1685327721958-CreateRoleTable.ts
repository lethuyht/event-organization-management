import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1685327721958 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "role"
        (
            "id"                uuid                        NOT NULL DEFAULT uuid_generate_v4(),
            "name"              varchar(255)                NOT NULL,
            "created_at"        timestamp with time zone    NOT NULL DEFAULT NOW(),
            "updated_at"        timestamp with time zone    NULL,

            CONSTRAINT "PK_role" PRIMARY KEY ("id")        
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT 1;`);
  }
}
