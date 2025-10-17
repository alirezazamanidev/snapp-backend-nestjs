import { IRideRequestedPayload, REDIS_CLIENT } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class NotificationService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}
  handleRideRequested(payload: IRideRequestedPayload) {
    // const { rideId, pickupLocation, destinationLocation, ridePrice, nearbyDrivers } = payload;
    //  for(const driver of nearbyDrivers) {
    //   this.redisClient.publish(`socket.io#driver:${driver.driverId}#`, JSON.stringify({
    //     type:2,
    //     data:['ride.requested',{
    //       rideId,
    //       pickupLocation,
    //       destinationLocation,
    //       ridePrice,
    //     }],
    //     ns
    //   }));
    //  }
  }
}
