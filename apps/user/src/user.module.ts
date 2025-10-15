import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { UserEntity } from './database/entities/user.entity';
import { SessionEntity } from './database/entities/session.entity';
import { RedisModule } from '@app/common/configs/redis.config';
import { SessionService } from './services/session.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([UserEntity, SessionEntity]),
    RedisModule.forRoot(process.env.REDIS_URL as string),
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, SessionService],
})
export class UserModule {}
