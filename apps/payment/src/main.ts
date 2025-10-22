import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AllExceptionFilter, USER_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentModule, {
    transport: Transport.GRPC,
    options: {
      package: USER_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'protos/user.proto'),
      url: process.env.USER_GRPC_URI,
    },
  });

  app.useGlobalFilters(new AllExceptionFilter());
  await app.listen()
    .then(() => {
      console.log('✅ User microservice is up and running! 🎉');
      console.log(`🌐 gRPC Server listening on: ${process.env.USER_GRPC_URI}`);
      console.log('📦 Package:', USER_PACKAGE_NAME);
      console.log('🔥 Ready to handle requests!');
    })
    .catch((error) => {
      console.error('❌ Failed to start User microservice:', error);
      process.exit(1);
    });
}

bootstrap().catch((error) => {
  console.error('💥 Bootstrap failed:', error);
  process.exit(1);
});
