import { Controller, Get } from '@nestjs/common';
import { LocationService } from './location.service';
import { GrpcMethod } from '@nestjs/microservices';
import { type IDriverOfflineRequest, type IDriverOnlineRequest, type IGetNearbyDriversRequest, LOCATION_SERVICE_NAME } from '@app/common';

@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @GrpcMethod(LOCATION_SERVICE_NAME,'driverOnline')
  driverOnline(dto: IDriverOnlineRequest) {
    return this.locationService.driverOnline(dto);
  }
  @GrpcMethod(LOCATION_SERVICE_NAME,'driverOffline')
  driverOffline(dto: IDriverOfflineRequest) {
    return this.locationService.driverOffline(dto);
  }
  @GrpcMethod(LOCATION_SERVICE_NAME,'getNearbyDrivers')
  getNearbyDrivers(dto: IGetNearbyDriversRequest): Promise<any> {
    return this.locationService.getNearbyDrivers(dto);
  }
}
