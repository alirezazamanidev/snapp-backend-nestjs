import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NOTIFICATION_QUEUE_NAME } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI as string],
      queue: NOTIFICATION_QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });
  
  // RabbitMQ microservice setup
  await app.listen();
  console.log('✅ Notification microservice is up and running! 🎉');
  console.log(`🌐 RabbitMQ Server listening on: ${process.env.RABBITMQ_URI}`);
  console.log('📦 queue: notification');
  console.log('🔥 Ready to handle requests!');
}
bootstrap();
