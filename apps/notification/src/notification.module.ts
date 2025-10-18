import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RedisModule, RIDE_MATCHING_PACKAGE_NAME, USER_PACKAGE_NAME } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    RedisModule.forRoot(process.env.REDIS_URL as string),
    ClientsModule.register([
      {
        name: USER_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: USER_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'protos/user.proto'),
          url: process.env.USER_GRPC_URI,
        },
      },
      {
        name: RIDE_MATCHING_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: RIDE_MATCHING_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'protos/ride-matching.proto'),
          url: process.env.RIDE_MATCHING_GRPC_URI,
        },
      },
      ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
