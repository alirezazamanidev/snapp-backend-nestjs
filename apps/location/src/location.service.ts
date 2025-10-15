import {
  Driver,
  IGetNearbyDriversRequest,
  IUpdateLocationRequest,
  REDIS_CLIENT,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';


@Injectable()
export class LocationService {
  private GEO_KEY = 'drivers:geo';
  private readonly validStatuses = ['online', 'busy', 'offline'];

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
    await this.redisClient.hset(
      `driver:status:${dto.userId}`,
      'lastSeen',
      String(Date.now()),
    );
    const status = await this.redisClient.hget(
      `driver:status:${dto.userId}`,
      'status',
    );
    if (!status) {
      await this.redisClient.hset(
        `driver:status:${dto.userId}`,
        'status',
        'online',
      );
    }
    await this.redisClient.publish(
      'channel:location_updates',
      JSON.stringify({
        driverId: dto.userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        timestamp: String(Date.now()),
      }),
    );
    return {
      message: 'Location updated successfully',
    };
  }

  async getNearbyDrivers(dto: IGetNearbyDriversRequest) {
    const { latitude, longitude, radius } = dto;

    const results = await this.redisClient.georadius(
      this.GEO_KEY,
      parseFloat(longitude),
      parseFloat(latitude),
      radius,
      'km',
      'WITHDIST',
      'COUNT',
      10,
      'ASC',
    ) as [string, string][];

    if (!results || results.length === 0) {
      return {
        drivers: [],
    
      };
    }

    const drivers: Driver[] = [];
    const pipeline = this.redisClient.pipeline();

    results.forEach(([member]) => {
      pipeline.hget(`driver:status:${member}`, 'status');
      pipeline.geopos(this.GEO_KEY, member);
    });

    const responses = await pipeline.exec();

    if (!responses) {
      return {
        drivers: [],
      };
    }

    for (let i = 0; i < results.length; i++) {
      const [member, dist] = results[i];
      const statusResponse = responses[i * 2];
      const posResponse = responses[i * 2 + 1];

      if (!statusResponse || !posResponse || statusResponse[0] || posResponse[0]) {
        continue;
      }

      const status = statusResponse[1] as string;
      const position = posResponse[1] as [string, string][];

      if (status && this.validStatuses.includes(status) && status !== 'offline') {
        if (position && position[0]) {
          const [lngPos, latPos] = position[0];
          drivers.push({
            driverId: member,
            lat: parseFloat(latPos),
            lng: parseFloat(lngPos),
            distance: parseFloat(dist),
            status: status,
          });
        }
      }
    }
    return {
      drivers,
      
    };
  }
}
