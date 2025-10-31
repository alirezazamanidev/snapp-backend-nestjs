import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ClientConfigModule } from './configs/client.config';
import { RedisModule } from '@app/common';

// Features
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';

// WebSockets
import { PassengerModule } from './websockets/passenger/passenger.module';
import { DriverModule } from './websockets/driver/driver.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ClientConfigModule,
    RedisModule.forRoot(process.env.REDIS_URL as string),
    // Features
    AuthModule,
    UserModule,
    // WebSockets
    PassengerModule,
    DriverModule,
  ],
})
export class GatewayModule {}
