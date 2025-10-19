import {
  Inject,
  Logger,
  OnModuleInit,
  UnauthorizedException,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  AUTH_SERVICE_NAME,
  IAuthService,
  IRideMatchingService,
  REDIS_CLIENT,
  RIDE_MATCHING_PACKAGE_NAME,
  RIDE_MATCHING_SERVICE_NAME,
  USER_PACKAGE_NAME,
} from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CalculateRideDto, RequestRideDto } from '../dtos/ride.dto';
import { DriverGateway } from './driver.gateway';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';
import { ErrorGrpcInterceptor } from '../common/interceptors/error-grpc.interceptor';
import Redis from 'ioredis';

@WebSocketGateway(8002, {
  namespace: 'passenger',
  cookie: true,
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
@UseInterceptors(ErrorGrpcInterceptor)
export class PassengerGateway
  implements
    OnModuleInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit
{
  private readonly logger = new Logger(PassengerGateway.name);
  @WebSocketServer()
  server: Server;

  private rideMatchingClient: IRideMatchingService;
  private authClient: IAuthService;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(RIDE_MATCHING_PACKAGE_NAME) private readonly rideClient: ClientGrpc,
    @Inject(USER_PACKAGE_NAME) private readonly authGrpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.rideMatchingClient = this.rideClient.getService<IRideMatchingService>(
      RIDE_MATCHING_SERVICE_NAME,
    );
    this.authClient =
      this.authGrpcClient.getService<IAuthService>(AUTH_SERVICE_NAME);
  }
  afterInit() {
    this.redisClient.subscribe('ride.accepted', (err, count) => {
      if (err) {
        this.logger.error(err);
      }
    });

    this.redisClient.on('message', (channel, message) => {
      const payload = JSON.parse(message);
      if (channel === 'ride.accepted') {
        const { userId, driver } = payload;
        console.log(userId, driver);
        this.server.to(`passenger:${userId}`).emit('ride.accepted', {
          driver,
        });
      }
    });
  }
  async handleConnection(client: Socket) {
    await this.authenticate(client);
    client.join(`passenger:${client.data.userId}`);
    this.logger.log(
      `Client connected: ${client.id} user id: ${client.data.userId}`,
    );
  }

  handleDisconnect(client: Socket) {
    client.leave(`passenger:${client.data.userId}`);
    this.logger.log(
      `Client disconnected: ${client.id} user id: ${client.data.userId}`,
    );
  }

  @SubscribeMessage('request-ride')
  async requestRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RequestRideDto,
  ) {
    const { pickupLocation, destinationLocation } = payload;
    const [plat, plng] = pickupLocation.split(',');
    const [dlat, dlng] = destinationLocation.split(',');
    return await lastValueFrom(
      this.rideMatchingClient.requestRide({
        userId: client.data.userId,
        pickupLocation: {
          lat: parseFloat(plat),
          lng: parseFloat(plng),
        },
        destinationLocation: {
          lat: parseFloat(dlat),
          lng: parseFloat(dlng),
        },
      }),
    );
  }
  @SubscribeMessage('calculate-ride')
  async calculateRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CalculateRideDto,
  ) {
    const { pickupLocation, destinationLocation } = payload;
    const [pickupLatitude, pickupLongitude] = pickupLocation.split(',');
    const [destinationLatitude, destinationLongitude] =
      destinationLocation.split(',');
    return await lastValueFrom(
      this.rideMatchingClient.calcultateRide({
        pickupLocation: {
          lng: parseFloat(pickupLatitude),
          lat: parseFloat(pickupLongitude),
        },
        destinationLocation: {
          lng: parseFloat(destinationLatitude),
          lat: parseFloat(destinationLongitude),
        },
      }),
    );
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
      this.authClient.validateSession({ sessionId: sessionId! }),
    );
    if (!result) {
      throw new WsException('Unauthorized');
    }
    client.data.userId = result.userId;
  }
}
