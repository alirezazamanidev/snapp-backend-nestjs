import { Observable } from 'rxjs';

export interface IUpdateLocationRequest {
  userId: string;
  latitude: number;
  longitude: number;
}
export interface IUpdateLocationResponse {
  message: string;
}
export interface IGetNearbyDriversRequest {
  latitude: number;
  longitude: number;
  radius: number;
}
export interface IGetNearbyDriversResponse {
  driverIds: string[];
}

export const LOCATION_PACKAGE_NAME = 'location';
export const LOCATION_SERVICE_NAME = 'LocationService';

export interface ILocationService {
  updateLocation(
    request: IUpdateLocationRequest,
  ): Promise<IUpdateLocationResponse>;
  getNearbyDrivers(
    request: IGetNearbyDriversRequest,
  ): Observable<IGetNearbyDriversResponse>;
}
