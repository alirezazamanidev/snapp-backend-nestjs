import { Observable } from "rxjs";

export interface IUpdateLocationRequest {
    userId: string;
    latitude: string;
    longitude: string;
}
export interface IUpdateLocationResponse {
    message: string;
}
export interface IGetNearbyDriversRequest {
    latitude: string;
    longitude: string;
    radius: number;
}
export interface IGetNearbyDriversResponse {
    drivers: Driver[];
   
}

export interface Driver {
    driverId: string;
    lat: number;
    lng: number;
    distance: number;
    status: string;
  }
export const LOCATION_PACKAGE_NAME = 'location';
export const LOCATION_SERVICE_NAME = 'LocationService';

export interface ILocationService {
    updateLocation(request: IUpdateLocationRequest): Promise<IUpdateLocationResponse>;
    getNearbyDrivers(request: IGetNearbyDriversRequest): Promise<IGetNearbyDriversResponse>;
}