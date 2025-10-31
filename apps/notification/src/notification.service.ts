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
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createServer } from 'http';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private userClientService: IUserService;
  private rideMatchingClientService: IRideMatchingService;
  private io: Server;
  private passengerNamespace: ReturnType<Server['of']>;
  private driverNamespace: ReturnType<Server['of']>;

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

    // Initialize Socket.IO server with Redis adapter
    const httpServer = createServer();
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    // Setup Redis IO Adapter
    const pubClient = this.redisClient.duplicate();
    const subClient = this.redisClient.duplicate();
    this.io.adapter(createAdapter(pubClient, subClient));

    // Get namespaces
    this.passengerNamespace = this.io.of('/passenger');
    this.driverNamespace = this.io.of('/driver');

    this.logger.log('Socket.IO server initialized with Redis adapter');
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

      // Emit to driver namespace for each driver
      for (const driverId of driverIds) {
        this.driverNamespace.to(`driver:${driverId}`).emit('ride.requested', {
          ride: rideDetails.ride,
          user,
        });
      }

      this.logger.log(
        `Ride requested notification sent to ${driverIds.length} drivers`,
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

      // Emit to passenger namespace
      this.passengerNamespace.to(`passenger:${userId}`).emit('ride.accepted', {
        driver,
      });

      this.logger.log(`Ride accepted notification sent to passenger ${userId}`);
    } catch (error) {
      this.logger.error('Error handling ride accepted:', error);
      throw error;
    }
  }
}
