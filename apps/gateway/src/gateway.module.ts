import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ClientConfigModule } from './configs/client.config';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { LocationController } from './controllers/location.controller';
import { PassengerGateway } from './controllers/passenger.gateway';
import { DriverGateway } from './controllers/driver.gateway';
import { RedisModule } from '@app/common';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ClientConfigModule,
    RedisModule.forRoot(process.env.REDIS_URL as string),
  ],
  providers: [PassengerGateway, DriverGateway],
  controllers: [AuthController, UserController, LocationController],
})
export class GatewayModule {}
