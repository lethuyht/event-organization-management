import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleData1685328097193 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "role" (name) VALUES ('Admin'),('User');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT 1;`);
  }
}
