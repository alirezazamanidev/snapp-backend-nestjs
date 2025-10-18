import { Observable } from "rxjs";
import { LatLng } from "../@types/latLng.type";

export const RIDE_MATCHING_PACKAGE_NAME = 'ride_matching';
export const RIDE_MATCHING_SERVICE_NAME = 'RideMatchingService';

export interface IRequestRideRequest {
    pickupLocation: LatLng;
    destinationLocation: LatLng;
    userId: string;
}

export interface IRequestRideResponse {
    message: string;
}


export interface IRideMatchingService {
    requestRide(request: IRequestRideRequest): Observable<IRequestRideResponse>;
    calcultateRide(request: ICalculateRideRequest): Observable<ICalculateRideResponse>;
    getRideDetails(request: IGetRideDetailsRequest): Observable<IGetRideDetailsResponse>;
}   

export interface ICalculateRideRequest {
    pickupLocation: LatLng;
    destinationLocation: LatLng;
}

export interface ICalculateRideResponse {
    distance: number;
    duration: number;
    price: number;
    routeCoordinates: LatLng[];
}

export interface IGetRideDetailsRequest {
    rideId: string;
}
export interface IGetRideDetailsResponse {
    ride: IRide;
}

export interface IRide {
    id: string;
    status: string;
    price: number;
    pickupLocation: LatLng;
    destinationLocation: LatLng;
}