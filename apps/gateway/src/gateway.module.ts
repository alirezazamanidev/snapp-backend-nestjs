import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ClientConfigModule } from './configs/client.config';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ClientConfigModule,
  ],

  controllers: [AuthController, UserController],
})
export class GatewayModule {}
