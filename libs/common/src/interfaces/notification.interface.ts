import { LatLng } from "../@types/latLng.type";
import { Driver } from "./location-grpc.interface";

export const NOTIFICATION_QUEUE_NAME = 'notification';

export interface IRideRequestedPayload {
    rideId: string;
    userId:string;
    pickupLocation: LatLng;
    destinationLocation: LatLng;
    ridePrice: number;
    nearbyDrivers: Driver[];
}