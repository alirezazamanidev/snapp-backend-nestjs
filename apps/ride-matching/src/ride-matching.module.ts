import { Module } from '@nestjs/common';
import { RideMatchingController } from './ride-matching.controller';
import { RideMatchingService } from './ride-matching.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from '@app/common';
import { RideEntity } from './entities/ride.entity';
import { ClientConfigModule } from './configs/client.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:join(process.cwd(),'.env')
    }),
    TypeOrmModule.forRootAsync({
      useClass:TypeOrmDbConfig
    }),
    TypeOrmModule.forFeature([RideEntity]),
    ClientConfigModule,
  ],
  controllers: [RideMatchingController],
  providers: [RideMatchingService],
})
export class RideMatchingModule {}
