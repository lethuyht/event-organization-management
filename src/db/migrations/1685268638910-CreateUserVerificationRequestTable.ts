import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserVerificationRequestTable1685268638910
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_verification_request" (
                "id"                uuid            NOT NULL        DEFAULT uuid_generate_v4(),
                "email"             varchar(255)    NOT NULl,
                "data"              jsonb,
                "code"              varchar(255),
                "expiration_time"   timestamp with time zone,
                "type"              varchar,
                "created_at"        timestamp with time zone    DEFAULT now(),
                "updated_at"        timestamp with time zone    DEFAULT now(),
                CONSTRAINT "pk_user_verification_request_id" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "user_verification_request";
    `);
  }
}
