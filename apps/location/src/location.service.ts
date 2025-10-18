import {
  IGetNearbyDriversRequest,
  IUpdateLocationRequest,
  REDIS_CLIENT,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class LocationService {
  private GEO_KEY = 'drivers:geo';
  private readonly validStatuses = ['online', 'busy'];

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async updateLocation(dto: IUpdateLocationRequest) {
    const now = Date.now().toString();
    const hashKey = `driver:status:${dto.userId}`;
    
    await this.redisClient.geoadd(this.GEO_KEY, dto.longitude, dto.latitude, dto.userId);

    await this.redisClient.hset(hashKey, 'status', 'online', 'lastSeen', now);

    return {
      message: 'Location updated successfully',
    };
  }

  async getNearbyDrivers(dto: IGetNearbyDriversRequest) {
    const { latitude, longitude, radius } = dto;
  
      const nearbyResults = await this.redisClient.georadius(
        this.GEO_KEY,
        longitude.toString(),
        latitude.toString(),
        radius.toString(),
        'km',
        'WITHCOORD',
        'WITHDIST',
        'COUNT',
        '50',
        'ASC'
      ) as [string, string, [string, string]][];
      if (!nearbyResults || nearbyResults.length === 0) {
        return { driverIds: [] };
      }
      const driverIds: string[] = [];
      for (const [driverId] of nearbyResults) {
        driverIds.push(driverId);
      }
      console.log(driverIds);
      return { driverIds };
  
  
  }
}