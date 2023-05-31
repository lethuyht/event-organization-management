import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1685261496499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "role"(
            "id"            uuid            NOT NULL    DEFAULT uuid_generate_v4(),
            "name"          varchar(255)    NOT NULL,
            "created_at"    timestamp with time zone    DEFAULT now(),
            "updated_at"    timestamp with time zone    DEFAULT now(),    
            CONSTRAINT "pk_role_id" PRIMARY KEY ("id")
        )   
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "role"
    `);
  }
}
