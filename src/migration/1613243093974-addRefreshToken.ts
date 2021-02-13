import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRefreshToken1613243093974 implements MigrationInterface {
  name = 'addRefreshToken1613243093974';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "expires" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e913e288156c133999341156a" ON "refresh_token" ("userId") `,
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
    await queryRunner.query(`DROP INDEX "IDX_8e913e288156c133999341156a"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
  }
}
