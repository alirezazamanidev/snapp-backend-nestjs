import {
  Inject,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  AUTH_SERVICE_NAME,
  IAuthService,
  IRideMatchingService,
  RIDE_MATCHING_PACKAGE_NAME,
  RIDE_MATCHING_SERVICE_NAME,
  USER_PACKAGE_NAME,
} from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CalculateRideDto, RequestRideDto } from '../dtos/ride.dto';
import { DriverGateway } from './driver.gateway';

@WebSocketGateway(8002, {
  namespace: 'passenger',
  cookie: true,
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class PassengerGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PassengerGateway.name);
  @WebSocketServer()
  server: Server;

  private rideMatchingClient: IRideMatchingService;
  private authClient: IAuthService;

  constructor(
    @Inject(RIDE_MATCHING_PACKAGE_NAME) private readonly rideClient: ClientGrpc,
    @Inject(USER_PACKAGE_NAME) private readonly authGrpcClient: ClientGrpc,
    private readonly driverGateway: DriverGateway
  ) {}

  onModuleInit() {
    this.rideMatchingClient = this.rideClient.getService<IRideMatchingService>(
      RIDE_MATCHING_SERVICE_NAME,
    );
    this.authClient =
      this.authGrpcClient.getService<IAuthService>(AUTH_SERVICE_NAME);
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
  async requestRide(@ConnectedSocket() client: Socket, @MessageBody() payload: RequestRideDto) {
    const {pickupLocation, destinationLocation} = payload;
    const [pickupLatitude, pickupLongitude] = pickupLocation.split(',');
    const [destinationLatitude, destinationLongitude] = destinationLocation.split(',');

    return await lastValueFrom(this.rideMatchingClient.requestRide({
      userId: client.data.userId,
      pickupLocation: {
        lng: parseFloat(pickupLatitude),
        lat: parseFloat(pickupLongitude),
      },
      destinationLocation: {
        lng: parseFloat(destinationLatitude),
        lat: parseFloat(destinationLongitude),
      },
    }));
  }
  @SubscribeMessage('calculate-ride')
  async calculateRide(@ConnectedSocket() client: Socket, @MessageBody() payload: CalculateRideDto) {
    const {pickupLocation, destinationLocation} = payload;
    const [pickupLatitude, pickupLongitude] = pickupLocation.split(',');
    const [destinationLatitude, destinationLongitude] = destinationLocation.split(',');
    return await lastValueFrom(this.rideMatchingClient.calcultateRide({
      pickupLocation: {
          lng: parseFloat(pickupLatitude),
        lat: parseFloat(pickupLongitude),
      },
      destinationLocation: {
        lng: parseFloat(destinationLatitude),
        lat: parseFloat(destinationLongitude),
      },
    }));
  }
  private async authenticate(client: Socket) {
    // auth
    const sessionId = client.request.headers.cookie
      ?.split('snapp-session=')[1]
      ?.split(';')[0];
    if (!sessionId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const result = await lastValueFrom(
      this.authClient.validateSession({ sessionId: sessionId! }),
    );
    if (!result) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }
    client.data.userId = result.userId;
  }
}
