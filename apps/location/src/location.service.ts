import { IUpdateLocationRequest, REDIS_CLIENT } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class LocationService {
  private GEO_KEY = 'drivers:geo';

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}
  async updateLocation(dto: IUpdateLocationRequest) {
    await this.redisClient.geoadd(
      this.GEO_KEY,
      dto.longitude,
      dto.latitude,
      dto.userId,
    );
    await this.redisClient.hset(`driver:status:${dto.userId}`,'lastSeen',String(Date.now()));
    const status = await this.redisClient.hget(`driver:status:${dto.userId}`,'status');
    if(!status)  await this.redisClient.hset(`driver:status:${dto.userId}`,'status','online');
    await this.redisClient.publish('channel:location_updates',JSON.stringify({
      driverId: dto.userId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timestamp: String(Date.now()),
    }));
    return {
      message: 'Location updated successfully',
    };

  }
}
