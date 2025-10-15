import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { RedisModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:join(process.cwd(),'.env'),
  }),RedisModule.forRoot(process.env.REDIS_URL  as string)],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
