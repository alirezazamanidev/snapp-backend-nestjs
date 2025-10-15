declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      GATEWAY_PORT: string;
      // db
      POSTGRES_USERNAME: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE: string;
      POSTGRES_PORT: number;
      POSTGRES_HOST: string;

      // grpc
      USER_GRPC_URI: string;
      LOCATION_GRPC_URI: string;
      // GOOGLE
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_CALLBACK_URL: string;
      // redis
      REDIS_URL: string;
    }
  }
}
