
export const NOTIFICATION_QUEUE_NAME = 'notification';

export interface IRideRequestedPayload {
    rideId: string;
    userId:string;
    driverIds: string[];
}