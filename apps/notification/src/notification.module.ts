import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:join(process.cwd(), '.env'),
  })],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
