import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { configService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'nest-access-control';
import { AppRoles } from './app.roles';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    AccessControlModule.forRoles(AppRoles),
    AuthModule,
    UsersModule,
    TokensModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
