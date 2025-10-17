import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';

export class RedisIoAdapter extends IoAdapter {
  private pubClient: Redis;
  private subClient: Redis;
  private logger = new Logger(RedisIoAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379',
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    // ایجاد native socket.io server
    const server = super.createIOServer(port, options);

    // ساخت client های Redis
    this.pubClient = new Redis(this.redisUrl);
    this.subClient = new Redis(this.redisUrl);
    server.adapter(createAdapter(this.pubClient, this.subClient),{
        key:'snapp'
    });
    this.logger.log('✅ Redis adapter attached to Socket.io server');

    this.pubClient.on('connect', () => {
      this.logger.log('✅ PubClient connected to Redis');
    });

    this.pubClient.on('error', (err) => {
      this.logger.error('❌ Failed to connect pubClient to Redis', err);
    });

    this.subClient.on('connect', () => {
      this.logger.log('✅ SubClient connected to Redis');
    });

    this.subClient.on('error', (err) => {
      this.logger.error('❌ Failed to connect subClient to Redis', err);
    });

    return server;
  }

  async close(server: Server): Promise<void> {
    try {
      if (this.pubClient) await this.pubClient.quit();
      if (this.subClient) await this.subClient.quit();
      this.logger.log('✅ Redis clients closed');
    } catch (error) {
      this.logger.error('❌ Error closing Redis clients', error);
    }
    return super.close(server);
  }
}
