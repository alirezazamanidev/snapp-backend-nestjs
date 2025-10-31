import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CalculateRideDto {
  @ApiProperty({
    description: 'Pickup location in format "lat,lng"',
    example: '35.6892,51.3890',
  })
  @IsNotEmpty()
  @IsString()
  pickupLocation: string;

  @ApiProperty({
    description: 'Destination location in format "lat,lng"',
    example: '35.7219,51.3347',
  })
  @IsNotEmpty()
  @IsString()
  destinationLocation: string;
}

