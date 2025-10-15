import { Controller, Get } from '@nestjs/common';
import { RideMatchingService } from './ride-matching.service';
import { GrpcMethod } from '@nestjs/microservices';
import { type IRequestRideRequest, RIDE_MATCHING_SERVICE_NAME } from '@app/common';

@Controller()
export class RideMatchingController {
  constructor(private readonly rideMatchingService: RideMatchingService) {}


  @GrpcMethod(RIDE_MATCHING_SERVICE_NAME, 'requestRide')
  requestRide(request: IRequestRideRequest) {
    return this.rideMatchingService.requestRide(request);
  }
}
