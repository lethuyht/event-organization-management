import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteSomeTable1687068047733 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS "event_request_detail" CASCADE;
            DROP TABLE IF EXISTS "event_request" CASCADE;   
            DROP TABLE IF EXISTS "contract_event_request_service_item" CASCADE;     
            DROP TABLE IF EXISTS "contract_event_request" CASCADE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        SELECT 1;
    `);
  }
}
