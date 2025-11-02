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
  }

  async handleRideRequested(payload: IRideRequestedPayload) {
    
      const { rideId, userId, driverIds } = payload;

      // Fetch user and ride details in parallel for better performance
      const [user, rideDetails] = await Promise.all([
        lastValueFrom(this.userClientService.getProfile({ userId })),
        lastValueFrom(
          this.rideMatchingClientService.getRideDetails({ rideId }),
        ), 
      ]);

        await this.redisClient.publish('ride.requested', JSON.stringify({
          user,
          rideDetails,  
          driverIds,
        }));
      

  }

  async handleRideAccepted(payload: IRideAcceptedPayload) {
   
   const { driverId, userId } = payload;
   const [driver, passenger] = await Promise.all([
    lastValueFrom(this.userClientService.getProfile({ userId: driverId })),
    lastValueFrom(this.userClientService.getProfile({ userId })),
   ]);
   await this.redisClient.publish('ride.accepted', JSON.stringify({
    driver,
    passenger,
   }));
  }
}
