import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { swaggerConfig } from './configs/swagger.config';
import cookieParser from 'cookie-parser';
import { AllExceptionFilter } from './common/filters/allException.filter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });
  // global exception filter
  app.useGlobalFilters(new AllExceptionFilter());
  // cookie parser
  app.use(cookieParser());
  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    swaggerConfig(app);
  }
  const port = process.env.GATEWAY_PORT ?? 3000;
  await app.listen(port);

  console.log(
    `🚀 Gateway successfully launched on: http://localhost:${port}/api`,
  );
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/swagger`,
  );
}

bootstrap().catch((error) => {
  console.error(
    '💥 Failed to start the Gateway application! Something went wrong:',
    error,
  );
  console.error('🔧 Please check your configuration and try again.');
  process.exit(1);
});
