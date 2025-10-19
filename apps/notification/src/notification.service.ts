import {
  IRideAcceptedPayload,
  IRideMatchingService,
  IRideRequestedPayload,
  IUserService,
  REDIS_CLIENT,
  RIDE_MATCHING_PACKAGE_NAME,
  RIDE_MATCHING_SERVICE_NAME,
  USER_PACKAGE_NAME,
  USER_SERVICE_NAME,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class NotificationService implements OnModuleInit {
  private userClientService: IUserService;
  private rideMatchingClientService: IRideMatchingService;
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(USER_PACKAGE_NAME) private readonly userClient: ClientGrpc,
    @Inject(RIDE_MATCHING_PACKAGE_NAME)
    private readonly rideMatchingClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userClientService =
      this.userClient.getService<IUserService>(USER_SERVICE_NAME);
    this.rideMatchingClientService =
      this.rideMatchingClient.getService<IRideMatchingService>(
        RIDE_MATCHING_SERVICE_NAME,
      );
  }

  async handleRideRequested(payload: IRideRequestedPayload) {
    const { rideId, userId, driverIds } = payload;
    const user = await lastValueFrom(
      this.userClientService.getProfile({ userId }),
    );
    const rideDetails = await lastValueFrom(this.rideMatchingClientService.getRideDetails({ rideId }));
    const message = {
      ride: rideDetails.ride,
      user,
      driverIds,
    };
    await this.redisClient.publish('ride.requested', JSON.stringify(message));
  }
  async handleRideAccepted(payload: IRideAcceptedPayload) {
    const { driverId, userId } = payload;
    const driver = await lastValueFrom(this.userClientService.getProfile({ userId: driverId }));
    const message = {
      driver,
      userId,
    };
    await this.redisClient.publish('ride.accepted', JSON.stringify(message));
  }
}
