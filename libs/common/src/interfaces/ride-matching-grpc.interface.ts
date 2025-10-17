import { Observable } from "rxjs";
import { Driver } from "./location-grpc.interface";

export const RIDE_MATCHING_PACKAGE_NAME = 'ride_matching';
export const RIDE_MATCHING_SERVICE_NAME = 'RideMatchingService';

export interface IRequestRideRequest {
    pickupLocation: Record<string, number>;
    destinationLocation: Record<string, number>;
    userId: string;
}

export interface IRequestRideResponse {
    
    rideId: string;
    pickupLocation: Record<string, number>;
    destinationLocation: Record<string, number>;
    ridePrice: number;
    nearbyDrivers:Driver[];
}


export interface IRideMatchingService {
    requestRide(request: IRequestRideRequest): Observable<IRequestRideResponse>;
}   