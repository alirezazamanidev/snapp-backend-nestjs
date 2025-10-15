import { Observable } from "rxjs";

export interface IUpdateLocationRequest {
    userId: string;
    latitude: string;
    longitude: string;
}
export interface IUpdateLocationResponse {
    message: string;
}
export const LOCATION_PACKAGE_NAME = 'location';
export const LOCATION_SERVICE_NAME = 'LocationService';

export interface ILocationService {
    updateLocation(request: IUpdateLocationRequest): Promise<IUpdateLocationResponse>;
}