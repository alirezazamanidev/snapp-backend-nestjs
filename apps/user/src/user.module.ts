import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RedisModule } from '@app/common/configs/redis.config';

// Features
import { AuthModule } from './features/auth/auth.module';
import { UserModule as UserFeatureModule } from './features/user/user.module';
import { SessionModule } from './features/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),
    RedisModule.forRoot(process.env.REDIS_URL as string),
    // Features
    AuthModule,
    UserFeatureModule,
    SessionModule,
  ],
})
export class UserModule {}
