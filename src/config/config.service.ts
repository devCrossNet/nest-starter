import { TypeOrmModuleOptions } from '@nestjs/typeorm';

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.env.POSTGRES_HOST,
      port: parseInt(this.env.POSTGRES_PORT, 10),
      username: this.env.POSTGRES_USER,
      password: this.env.POSTGRES_PASSWORD,
      database: this.env.POSTGRES_DATABASE,
      entities: ['**/*.entity{.ts,.js}'],
      migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],
      cli: {
        migrationsDir: 'src/migration',
      },
      ssl: this.env.NODE_ENV === 'production',
      autoLoadEntities: true,
    };
  }
}

const configService = new ConfigService(process.env);

export { configService };
