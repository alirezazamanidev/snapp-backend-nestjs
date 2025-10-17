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
    const now = Date.now().toString();
  
    // 1. اضافه کردن یا بروزرسانی موقعیت در GEO
    await this.redisClient.geoadd(this.GEO_KEY, dto.longitude, dto.latitude, dto.userId);
  
    // 2. بروزرسانی lastSeen و status در یک دستور
    await this.redisClient.hset(
      `driver:status:${dto.userId}`,
      {
        lastSeen: now,
        status: (await this.redisClient.hget(`driver:status:${dto.userId}`, 'status')) || 'online',
      }
    );
  
    // 3. انتشار پیام location update
    await this.redisClient.publish(
      'channel:location_updates',
      JSON.stringify({
        driverId: dto.userId,
        lat: dto.latitude,
        lng: dto.longitude,
        timestamp: now,
      })
    );
  
    return {
      success: true,
      message: 'Location updated successfully',
    };
  }
  async getNearbyDrivers(dto: IGetNearbyDriversRequest) {
    const { latitude, longitude, radius } = dto;
  
    // 1. جستجوی راننده‌ها در شعاع مشخص
    const results = await this.redisClient.geosearch(
      this.GEO_KEY,
      'FROMLONLAT',
      longitude.toString(),
      latitude.toString(),
      'BYRADIUS',
      radius.toString(),
      'km',
      'WITHDIST',
      'COUNT',
      '10',
      'ASC'
    ) as [string, string][]; // [driverId, distance]
  
    if (!results?.length) {
      return { drivers: [] };
    }
  
    const drivers: Driver[] = [];
    const pipeline = this.redisClient.pipeline();
  
    // 2. ایجاد pipeline برای گرفتن status و موقعیت دقیق راننده‌ها
    for (const [driverId] of results) {
      pipeline.hget(`driver:status:${driverId}`, 'status');
      pipeline.geopos(this.GEO_KEY, driverId);
    }
  
    const responses = await pipeline.exec();
  
    if (!responses?.length) {
      return { drivers: [] };
    }
  
    // 3. پردازش نتایج pipeline
    for (let i = 0; i < results.length; i++) {
      const [driverId, distStr] = results[i];
      const statusResponse = responses[i * 2];
      const posResponse = responses[i * 2 + 1];
  
      // بررسی خطا در هر عملیات
      if (!statusResponse || !posResponse || statusResponse[0] || posResponse[0]) {
        continue;
      }
  
      const status = statusResponse[1] as string;
      const positions = posResponse[1] as [string, string][]; // [[lng, lat]]
  
      if (!status || !this.validStatuses.includes(status) || status === 'offline') {
        continue;
      }
  
      if (!positions?.[0]) {
        continue;
      }
  
      const [lngPos, latPos] = positions[0];
  
      drivers.push({
        driverId,
        lat: parseFloat(latPos),
        lng: parseFloat(lngPos),
        distance: parseFloat(distStr),
        status,
      });
    }
  
    return { drivers };
  }
  
}
