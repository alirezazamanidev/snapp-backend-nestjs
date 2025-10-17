import {
  AUTH_SERVICE_NAME,
  IAuthService,
  ILocationService,
  LOCATION_PACKAGE_NAME,
  LOCATION_SERVICE_NAME,
  USER_PACKAGE_NAME,
} from '@app/common';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
    ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { async, lastValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { UpdateLocationDto } from '../dtos/location.dto';

@WebSocketGateway(8002, {
  namespace: 'driver',
  cookie: true,
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class DriverGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(DriverGateway.name);
  private authClientService: IAuthService;
  private locationClientService: ILocationService;
  constructor(
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

    return this.locationClientService.updateLocation({
      userId: client.data.userId,
      latitude: payload.latitude,
      longitude: payload.longitude,
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
