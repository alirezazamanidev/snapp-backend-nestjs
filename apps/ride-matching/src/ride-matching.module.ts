import { Module } from '@nestjs/common';
import { RideMatchingController } from './ride-matching.controller';
import { RideMatchingService } from './ride-matching.service';

@Module({
  imports: [],
  controllers: [RideMatchingController],
  providers: [RideMatchingService],
})
export class RideMatchingModule {}
