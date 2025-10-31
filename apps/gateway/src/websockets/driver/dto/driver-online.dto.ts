import type { LatLng } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class DriverOnlineDto {
  @ApiProperty({
    description: 'Driver current location',
    example: { lat: 35.6892, lng: 51.3890 },
  })
  @IsNotEmpty()
  @IsObject()
  location: LatLng;
}

