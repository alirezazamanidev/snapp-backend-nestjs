import { Observable } from "rxjs";

export const RIDE_MATCHING_PACKAGE_NAME = 'ride_matching';
export const RIDE_MATCHING_SERVICE_NAME = 'RideMatchingService';

export interface IRequestRideRequest {
    pickupLocation: Record<string, number>;
    destinationLocation: Record<string, number>;
    userId: string;
}

export interface IRequestRideResponse {
    message: string;
}


export interface IRideMatchingService {
    requestRide(request: IRequestRideRequest): Observable<IRequestRideResponse>;
}   