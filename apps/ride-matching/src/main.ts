import { NestFactory } from '@nestjs/core';
import { RideMatchingModule } from './ride-matching.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AllExceptionFilter, RIDE_MATCHING_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(RideMatchingModule, {
    transport: Transport.GRPC,
    options: {
      package: RIDE_MATCHING_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'protos/ride-matching.proto'),
      url: process.env.RIDE_MATCHING_GRPC_URI,
    },
  });

  app.useGlobalFilters(new AllExceptionFilter());
  await app.listen()
    .then(() => {
      console.log('✅ Ride Matching microservice is up and running! 🎉');
      console.log(`🌐 gRPC Server listening on: ${process.env.RIDE_MATCHING_GRPC_URI}`);
      console.log('📦 Package:', RIDE_MATCHING_PACKAGE_NAME);
      console.log('🔥 Ready to handle requests!');
    })
    .catch((error) => {
      console.error('❌ Failed to start Ride Matching microservice:', error);
      process.exit(1);
    });
}

bootstrap().catch((error) => {
  console.error('💥 Bootstrap failed:', error);
  process.exit(1);
});
