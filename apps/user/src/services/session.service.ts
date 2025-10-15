import { SessionEntity } from '../database/entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '@app/common/configs/redis.config';
import Redis from 'ioredis';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async create(userId: string, ipAddress: string, userAgent: string) {
    const session = this.sessionRepository.create({
      userId,
      ipAddress,
      isActive: true,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days,
      userAgent,
    });
    await this.sessionRepository.save(session);
    const payload = JSON.stringify({
      userId,
      exp: session.expiresAt.getTime(),
    });
    await this.redisClient.setex(`session:${session.id}`, 60 * 30, payload); // 30 minutes;
    return session.id;
  }

  async validate(sessionId: string) {
    if(!sessionId) throw new RpcException({code:401,message:'Session ID is required'});
    const cachedSession = await this.redisClient.get(`session:${sessionId}`);
    if(cachedSession){
        const session = JSON.parse(cachedSession);
        await this.redisClient.expire(`session:${sessionId}`, 60 * 30);
        return {
            userId: session.userId,
            sessionId,
        }
    }
    const session = await this.sessionRepository.findOne({
        where: {
            id: sessionId,
        },
    });
    if(!session) throw new RpcException({code:401,message:'Invalid session ID'});
    if(session.expiresAt < new Date()) {
        await this.invalidate(sessionId);
        throw new RpcException({code:401,message:'Session expired'});
    }

    const payload = JSON.stringify({
        userId: session.userId,
        exp: session.expiresAt.getTime(),
    });
    await this.redisClient.setex(`session:${sessionId}`, 60 * 30, payload);
    return {
        userId: session.userId,
        sessionId,
    }
    
  }
  async invalidate(sessionId: string) {
    await this.redisClient.del(`session:${sessionId}`);
    await this.sessionRepository.update(sessionId, { isActive: false });
  }
}
