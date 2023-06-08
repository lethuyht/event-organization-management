import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventRequestDetail1686079665640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "event_request_detail"(
            "id"                            uuid                        NOT NULL    DEFAULT uuid_generate_v4(),
            "event_request_id"              uuid                        NOT NULL,
            "customer_name"                 varchar(5255)               NULL,
            "phone_number"                  varchar(50)                 NULL   ,
            "amount_attendee"               int                         NOT NULL,
            "start_hire_date"               timestamp with time zone    NOT NULL,
            "end_hire_date"                 timestamp with time zone    NOT NULL,
            "address"                       text                        NULL,
            "is_accepted_combo_service"     boolean                     NOT NULL DEFAULT false,
            "created_at"                    timestamp with time zone    DEFAULT now(),
            "updated_at"                    timestamp with time zone    DEFAULT now(),    
            CONSTRAINT "pk_event_request_detail_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_event_request_detail_event_request_id" FOREIGN KEY ("event_request_id") REFERENCES "event_request" ("id") ON DELETE CASCADE
        ) 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` SELECT 1; `);
  }
}
