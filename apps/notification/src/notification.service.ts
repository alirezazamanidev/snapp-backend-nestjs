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
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private userClientService: IUserService;
  private rideMatchingClientService: IRideMatchingService;
  private redisPublisher: Redis;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(USER_PACKAGE_NAME) private readonly userClient: ClientGrpc,
    @Inject(RIDE_MATCHING_PACKAGE_NAME)
    private readonly rideMatchingClient: ClientGrpc,
  ) {}

  async onModuleInit() {
    this.userClientService =
      this.userClient.getService<IUserService>(USER_SERVICE_NAME);
    this.rideMatchingClientService =
      this.rideMatchingClient.getService<IRideMatchingService>(
        RIDE_MATCHING_SERVICE_NAME,
      );

    // Create a separate Redis client for publishing messages
    this.redisPublisher = this.redisClient.duplicate();

    this.logger.log('Notification service initialized');
  }

  async handleRideRequested(payload: IRideRequestedPayload) {
    try {
      const { rideId, userId, driverIds } = payload;

      // Fetch user and ride details in parallel for better performance
      const [user, rideDetails] = await Promise.all([
        lastValueFrom(this.userClientService.getProfile({ userId })),
        lastValueFrom(
          this.rideMatchingClientService.getRideDetails({ rideId }),
        ),
      ]);

      // Publish notification to Redis for each driver
      // Gateway will subscribe to these channels and emit to connected clients
      const notificationData = {
        event: 'ride.requested',
        data: {
          ride: rideDetails.ride,
          user,
        },
      };

      for (const driverId of driverIds) {
        await this.redisPublisher.publish(
          `notification:driver:${driverId}`,
          JSON.stringify(notificationData),
        );
      }

      this.logger.log(
        `Ride requested notification published for ${driverIds.length} drivers`,
      );
    } catch (error) {
      this.logger.error('Error handling ride requested:', error);
      throw error;
    }
  }

  async handleRideAccepted(payload: IRideAcceptedPayload) {
    try {
      const { driverId, userId } = payload;
      const driver = await lastValueFrom(
        this.userClientService.getProfile({ userId: driverId }),
      );

      // Publish notification to Redis for passenger
      // Gateway will subscribe to this channel and emit to connected client
      const notificationData = {
        event: 'ride.accepted',
        data: {
          driver,
        },
      };

      await this.redisPublisher.publish(
        `notification:passenger:${userId}`,
        JSON.stringify(notificationData),
      );

      this.logger.log(
        `Ride accepted notification published for passenger ${userId}`,
      );
    } catch (error) {
      this.logger.error('Error handling ride accepted:', error);
      throw error;
    }
  }
}
