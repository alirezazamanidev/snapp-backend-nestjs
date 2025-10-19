import { Controller, Get } from '@nestjs/common';
import { RideMatchingService } from './ride-matching.service';
import { GrpcMethod } from '@nestjs/microservices';
import { type IAcceptRideRequest, type ICalculateRideRequest, type IGetRideDetailsRequest, type IRequestRideRequest, RIDE_MATCHING_SERVICE_NAME } from '@app/common';

@Controller()
export class RideMatchingController {
  constructor(private readonly rideMatchingService: RideMatchingService) {}


  @GrpcMethod(RIDE_MATCHING_SERVICE_NAME, 'requestRide')
  requestRide(request: IRequestRideRequest) {
    return this.rideMatchingService.requestRide(request);
  }
  @GrpcMethod(RIDE_MATCHING_SERVICE_NAME, 'calcultateRide')
  calculateRide(request: ICalculateRideRequest) {
    return this.rideMatchingService.calculateRide(request);
  }
  @GrpcMethod(RIDE_MATCHING_SERVICE_NAME, 'getRideDetails')
  getRideDetails(request: IGetRideDetailsRequest) {
    return this.rideMatchingService.getRideDetails(request.rideId);
  }
  @GrpcMethod(RIDE_MATCHING_SERVICE_NAME, 'acceptRide')
  acceptRide(request: IAcceptRideRequest) {
    return this.rideMatchingService.acceptRide(request);
  }
}
