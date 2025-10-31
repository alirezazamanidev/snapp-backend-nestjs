import { Observable } from 'rxjs';
import { LatLng } from '../@types/latLng.type';

export interface IDriverOnlineRequest {
  userId: string;
  location:LatLng
}
export interface IDriverOnlineResponse {
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
export interface IDriverOfflineRequest {
  driverId: string;
}
export interface IDriverOfflineResponse {
  message: string;
}
export const LOCATION_PACKAGE_NAME = 'location';
export const LOCATION_SERVICE_NAME = 'LocationService';

export interface ILocationService {
  driverOnline(request: IDriverOnlineRequest): Promise<IDriverOnlineResponse>;
  driverOffline(request: IDriverOfflineRequest): Promise<IDriverOfflineResponse>;
  getNearbyDrivers(request: IGetNearbyDriversRequest): Observable<IGetNearbyDriversResponse>;
}
