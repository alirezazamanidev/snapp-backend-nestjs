import { NestFactory } from '@nestjs/core';
import { LocationModule } from './location.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { LOCATION_PACKAGE_NAME } from '@app/common/interfaces/location-grpc.interface';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LocationModule, {
    transport: Transport.GRPC,
    options: {
      package: LOCATION_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'protos/location.proto'),
      url: process.env.LOCATION_GRPC_URI,
    },
  });

  await app.listen()
    .then(() => {
      console.log('✅ Location microservice is up and running! 🎉');
      console.log(`🌐 gRPC Server listening on: ${process.env.LOCATION_GRPC_URI}`);
      console.log('📦 Package:', LOCATION_PACKAGE_NAME);
      console.log('🔥 Ready to handle requests!');
    })
    .catch((error) => {
      console.error('❌ Failed to start Location microservice:', error);
      process.exit(1);
    });
}

bootstrap().catch((error) => {
  console.error('💥 Bootstrap failed:', error);
  process.exit(1);
});
