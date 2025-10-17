import {
  IRideRequestedPayload,
  IUserService,
  REDIS_CLIENT,
  USER_PACKAGE_NAME,
  USER_SERVICE_NAME,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import Redis from 'ioredis';

@Injectable()
export class NotificationService implements OnModuleInit {
  private userClientService: IUserService;
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(USER_PACKAGE_NAME) private readonly userClient: ClientGrpc,
  ) {}
  onModuleInit() {
    this.userClientService =
      this.userClient.getService<IUserService>(USER_SERVICE_NAME);
  }
  async handleRideRequested(payload: IRideRequestedPayload) {
    const {
      rideId,
      userId,
      pickupLocation,
      destinationLocation,
      ridePrice,
      nearbyDrivers,
    } = payload;
    const user = await this.userClientService.getProfile({ userId });
    await Promise.all(
      nearbyDrivers.map((driver) =>
        this.redisClient.publish(
          `snapp#driver#driver:${driver.driverId}#`,
          JSON.stringify({
            type: 2,
            data: [
              'ride.requested',
              { rideId, pickupLocation, destinationLocation, ridePrice,user },
            ],
            nsp: '/driver',
          }),
        ),
      ),
    );
  }
}
