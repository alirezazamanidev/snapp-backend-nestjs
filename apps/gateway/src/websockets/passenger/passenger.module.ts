import { Module } from '@nestjs/common';
import { PassengerGateway } from './passenger.gateway';

@Module({
  providers: [PassengerGateway],
})
export class PassengerModule {}

