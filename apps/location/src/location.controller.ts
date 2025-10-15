import { Controller, Get } from '@nestjs/common';
import { LocationService } from './location.service';
import { GrpcMethod } from '@nestjs/microservices';
import { type IGetNearbyDriversRequest, type IUpdateLocationRequest, LOCATION_SERVICE_NAME } from '@app/common';

@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @GrpcMethod(LOCATION_SERVICE_NAME,'updateLocation')
  updateLocation(dto: IUpdateLocationRequest) {
    return this.locationService.updateLocation(dto);
  }
  @GrpcMethod(LOCATION_SERVICE_NAME,'getNearbyDrivers')
  getNearbyDrivers(dto: IGetNearbyDriversRequest): Promise<any> {
    return this.locationService.getNearbyDrivers(dto);
  }
}
