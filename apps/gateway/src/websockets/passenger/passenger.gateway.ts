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
  Role,
  USER_PACKAGE_NAME,
} from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CalculateRideDto } from './dto/calculate-ride.dto';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';

@WebSocketGateway(8002, {
  namespace: 'passenger',
  cookie: true,
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
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

  async afterInit(server: Server) {
    await this.redisClient.subscribe('ride.accepted');
    this.redisClient.on('message', (channel, message) => {
      if (channel === 'ride.accepted') {
        const { driver, passenger } = JSON.parse(message);
        this.server.to(`passenger:${passenger.userId}`).emit('ride.accepted', {
          driver,
          passenger,
        });
      }
    });
  }

  async handleConnection(client: Socket) {
    try {
      await this.authenticate(client);

      this.logger.log(
        `Client connected: ${client.id} user id: ${client.data.userId}`,
      );
    } catch (error) {
      this.logger.error(`Connection failed for client ${client.id}`, error);
      client.disconnect();
    }
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
    @MessageBody() payload: CalculateRideDto,
  ) {
    const { pickupLocation, destinationLocation } = payload;
    const [plat, plng] = pickupLocation.split(',');
    const [dlat, dlng] = destinationLocation.split(',');

    await lastValueFrom(
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
    client.join(`passenger:${client.data.userId}`);
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
    const sessionId = client.request.headers.cookie
      ?.split('snapp-session=')[1]
      ?.split(';')[0];

    if (!sessionId) {
      throw new WsException('Unauthorized: Session ID is required');
    }

    const result = await lastValueFrom(
      this.authClient.validateSession({ sessionId: sessionId! }),
    );

    if (!result) {
      throw new WsException('Unauthorized: Invalid session');
    }

    if (result.role !== Role.USER) {
      throw new WsException('Forbidden: User role required');
    }

    client.data.userId = result.userId;
  }
}
