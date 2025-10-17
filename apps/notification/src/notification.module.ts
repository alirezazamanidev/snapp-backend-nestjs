import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RedisModule } from '@app/common';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:join(process.cwd(), '.env'),
  }),RedisModule.forRoot(process.env.REDIS_URL as string)],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
