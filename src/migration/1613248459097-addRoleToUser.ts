import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRoleToUser1613248459097 implements MigrationInterface {
  name = 'addRoleToUser1613248459097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" character varying(16) NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "refresh_token"."expires" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."createDateTime" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."lastChangedDateTime" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."lastChangedDateTime" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user"."createDateTime" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "refresh_token"."expires" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
  }
}
