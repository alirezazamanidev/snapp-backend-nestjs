import { SessionEntity } from '../database/entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '@app/common/configs/redis.config';
import Redis from 'ioredis';
import { RpcException } from '@nestjs/microservices';
import { Role } from '@app/common';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async create({userId, ipAddress, userAgent}:{userId: string, ipAddress: string, userAgent: string }) {
    const normalizedUserAgent = userAgent?.trim().toLowerCase() || '';
    let session=await this.sessionRepository.findOne({
      where:{
        userId,
        ipAddress,
        userAgent:normalizedUserAgent,
      }
    })
    if(session) {
      if(!session.isActive) session.isActive = true;
      session.expiresAt=new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days
      session.lastLoginAt=new Date();
      session=await this.sessionRepository.save(session);
    }
    session=this.sessionRepository.create({
      userId,
      ipAddress,
      userAgent:normalizedUserAgent,
      isActive:true,
      expiresAt:new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days
      lastLoginAt: new Date(),
    });
    session=await this.sessionRepository.save(session);
    return session.id;

  }

  async validate(sessionId: string) {
    if(!sessionId) throw new RpcException({ code: 401, message: 'Session ID is required' });
    const catchedSession=await this.redisClient.get(`session:${sessionId}`);
    if(catchedSession) {
      const sessionData = JSON.parse(catchedSession);
      await this.redisClient.expire(`session:${sessionId}`, 60 * 30); // 30 minutes
      return {
        sessionId,
        userId: sessionData.userId,
      }
    }
    const session=await this.sessionRepository.findOne({
      where:{
        id:sessionId,
        isActive:true,
      }
    })
    if(!session) throw new RpcException({ code: 401, message: 'Invalid session ID' });
    if(session.expiresAt < new Date()) {
      await this.invalidate(sessionId);
      throw new RpcException({ code: 401, message: 'Session expired' });
    }
    const payload ={
      userId: session.userId,
    }
    await this.redisClient.setex(`session:${sessionId}`, 60 * 30, JSON.stringify(payload)); // 30 minutes
    return {
      sessionId,
      userId: session.userId,
      }
    
  }
  async invalidate(sessionId: string) {
    if (!sessionId)
      throw new RpcException({ code: 401, message: 'Session ID is required' });
    await this.redisClient.del(`session:${sessionId}`);
    await this.sessionRepository.update(sessionId, { isActive: false });
    return {
      message: 'Session invalidated',
    };
  }
  async invalidateAllSessions(userId: string) {
    if (!userId)
      throw new RpcException({ code: 401, message: 'User ID is required' });
    const sessions = await this.sessionRepository.find({ where: { userId } });
    for (const session of sessions) {
      await this.redisClient.del(`session:${session.id}`);
      await this.sessionRepository.update(session.id, { isActive: false });
    }
    return {
      message: 'All sessions invalidated',
    };
  }
}
