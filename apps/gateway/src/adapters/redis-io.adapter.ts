
import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createClient, RedisClientType } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

export class RedisIoAdapter extends IoAdapter {
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
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
    this.pubClient = createClient({ url: this.redisUrl });
    this.subClient = this.pubClient.duplicate();
    server.adapter(createAdapter(this.pubClient, this.subClient));
    this.logger.log('✅ Redis adapter attached to Socket.io server');

    this.pubClient.connect().catch((err) => {
      this.logger.error('❌ Failed to connect pubClient to Redis', err);
    });

    this.subClient.connect().catch((err) => {
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
