import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1685261698024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "user" (
            "id"            uuid            NOT NULL     DEFAULT uuid_generate_v4(),
            "role_id"       uuid            NOT NULL,
            "email"         varchar(255)    NOT NULL,
            "password"      varchar         NOT NULL,
            "first_name"    varchar(255),
            "last_name"     varchar(255),
            "created_at"    timestamp with time zone    DEFAULT now(),
            "updated_at"    timestamp with time zone    DEFAULT now(),
            CONSTRAINT "pk_user_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_user_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE,
            CONSTRAINT "unq_user_email" UNIQUE ("email")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "user"
    `);
  }
}
