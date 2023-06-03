import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContractTable1685781236436 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "contract" (
                "id"            uuid            NOT NULL    DEFAULT uuid_generate_v4(),
                "type"          varchar(255)    NOT NULL,
                "hire_date"     timestamp with time zone    NOT NULL,
                "total_price"   float           NOT NULL    DEFAULT 0,
                "address"       varchar         NOT NULL,
                "details"       jsonb           NOT NULL,
                "file_url"      varchar         NULL,
                "status"        varchar(255)    NOT NULL    DEFAULT 'draff',
                "user_id"       uuid            NOT NULL,
                "created_at"    timestamp with time zone    DEFAULT now(),
                "updated_at"    timestamp with time zone    DEFAULT now(),
                CONSTRAINT "pk_contract_id" PRIMARY KEY ("id"),
                CONSTRAINT "fk_contract_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "contract"
    `);
  }
}
