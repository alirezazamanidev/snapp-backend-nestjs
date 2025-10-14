import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ClientConfigModule } from './configs/client.config';
import { AuthController } from './controllers/auth.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ClientConfigModule,
    
    ],

    controllers:[AuthController],
})
export class GatewayModule {}
