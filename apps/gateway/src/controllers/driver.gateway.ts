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
  USER_PACKAGE_NAME,
} from '@app/common';
import {
  Inject,
  Logger,
  OnModuleInit,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
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
import { async, lastValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { UpdateLocationDto } from '../dtos/location.dto';
import Redis from 'ioredis';
import { AcceptRideDto } from '../dtos/ride.dto';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';
import { ErrorGrpcInterceptor } from '../common/interceptors/error-grpc.interceptor';

@WebSocketGateway(8002, {
  namespace: 'driver',
  cookie: true,
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
@UseInterceptors(ErrorGrpcInterceptor)
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
    @Inject(RIDE_MATCHING_PACKAGE_NAME) private readonly rideMatchingClient: ClientGrpc,
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
      this.rideMatchingClient.getService<IRideMatchingService>(RIDE_MATCHING_SERVICE_NAME);
  }
  afterInit() {
    this.redisClient.subscribe('ride.requested', (err, count) => {
      if (err) {
        this.logger.error(err);
      }
      this.redisClient.on('message', (channel, message) => {
        const payload = JSON.parse(message);
        if (channel === 'ride.requested') {
          for (const driverId of payload.driverIds) {
            this.server
              .to(`driver:${driverId}`)
              .emit('ride.requested', {
                ride: payload.ride,
                user: payload.user,
                });
          }
        }
      });
    });
  }

  async handleConnection(client: Socket) {
    await this.authenticate(client);

    client.join(`driver:${client.data.userId}`);
    this.logger.log(
      `Client connected: ${client.id} user id: ${client.data.userId}`,
    );
  }

  handleDisconnect(client: Socket) {
    client.leave(`driver:${client.data.userId}`);
    this.logger.log(
      `Client disconnected: ${client.id} user id: $/*  */{client.data.userId}`,
    );
  }

  @SubscribeMessage('update-location')
  async updateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateLocationDto,
  ) {
    return await this.locationClientService.updateLocation({
      userId: client.data.userId,
      latitude: payload.latitude,
      longitude: payload.longitude,
    });
  }

  @SubscribeMessage('ride-accepted')
   async acceptRide(@ConnectedSocket() client: Socket, @MessageBody() payload: AcceptRideDto) {
  
    return await this.rideMatchingClientService.acceptRide({
      rideId: payload.rideId,
      driverId: client.data.userId,
    });
  }

  private async authenticate(client: Socket) {
    // auth
    const sessionId = client.request.headers.cookie
      ?.split('snapp-session=')[1]
      ?.split(';')[0];
    if (!sessionId) {
      throw new WsException('Unauthorized');
    }

    const result = await lastValueFrom(
      this.authClientService.validateSession({ sessionId: sessionId! }),
    );
    if (!result) {
      throw new WsException('Unauthorized');
    }
    client.data.userId = result.userId;
  }
}
