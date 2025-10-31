import {
  AUTH_SERVICE_NAME,
  IAuthService,
  ILocationService,
  IRideMatchingService,
  LOCATION_PACKAGE_NAME,
  LOCATION_SERVICE_NAME,
  REDIS_CLIENT,
  RIDE_MATCHING_PACKAGE_NAME,
  RIDE_MATCHING_SERVICE_NAME,
  Role,
  USER_PACKAGE_NAME,
} from '@app/common';
import { Inject, Logger, OnModuleInit, UseFilters } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { lastValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { AcceptRideDto } from './dto/accept-ride.dto';
import { DriverOnlineDto } from './dto/driver-online.dto';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';

@WebSocketGateway(8002, {
  namespace: 'driver',
  cookie: true,
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
export class DriverGateway
  implements
    OnModuleInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit
{
  private readonly logger = new Logger(DriverGateway.name);
  private authClientService: IAuthService;
  private locationClientService: ILocationService;
  private rideMatchingClientService: IRideMatchingService;

  constructor(
    @Inject(RIDE_MATCHING_PACKAGE_NAME)
    private readonly rideMatchingClient: ClientGrpc,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(USER_PACKAGE_NAME) private readonly AuthClient: ClientGrpc,
    @Inject(LOCATION_PACKAGE_NAME) private readonly LocationClient: ClientGrpc,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.authClientService =
      this.AuthClient.getService<IAuthService>(AUTH_SERVICE_NAME);
    this.locationClientService =
      this.LocationClient.getService<ILocationService>(LOCATION_SERVICE_NAME);
    this.rideMatchingClientService =
      this.rideMatchingClient.getService<IRideMatchingService>(
        RIDE_MATCHING_SERVICE_NAME,
      );
  }

  async afterInit(server: Server) {
  
  }

  async handleConnection(client: Socket) {
    try {
      await this.authenticate(client);
      client.join(`driver:${client.data.userId}`);
      this.logger.log(
        `Client connected: ${client.id} user id: ${client.data.userId}`,
      );
    } catch (error) {
      this.logger.error(`Connection failed for client ${client.id}`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      await this.locationClientService.driverOffline({
        driverId: client.data.userId,
      });
      client.leave(`driver:${client.data.userId}`);
      this.logger.log(
        `Client disconnected: ${client.id} user id: ${client.data.userId}`,
      );
    } catch (error) {
      this.logger.error(`Disconnect error for client ${client.id}`, error);
    }
  }

  @SubscribeMessage('driver-online')
  driverOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DriverOnlineDto,
  ) {
    return this.locationClientService.driverOnline({
      userId: client.data.userId,
      location: payload.location,
    });
  }

  @SubscribeMessage('driver-offline')
  async driverOffline(@ConnectedSocket() client: Socket) {
    return await this.locationClientService.driverOffline({
      driverId: client.data.userId,
    });
  }

  @SubscribeMessage('ride-accepted')
  async acceptRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AcceptRideDto,
  ) {
    return await this.rideMatchingClientService.acceptRide({
      rideId: payload.rideId,
      driverId: client.data.userId,
    });
  }

  private async authenticate(client: Socket) {
    const sessionId = client.request.headers.cookie
      ?.split('snapp-session=')[1]
      ?.split(';')[0];

    if (!sessionId) {
      throw new WsException('Unauthorized: Session ID is required');
    }

    const result = await lastValueFrom(
      this.authClientService.validateSession({ sessionId: sessionId! }),
    );

    if (!result) {
      throw new WsException('Unauthorized: Invalid session');
    }

    if (result.role !== Role.DRIVER) {
      throw new WsException('Forbidden: Driver role required');
    }

    client.data.userId = result.userId;
  }
}
