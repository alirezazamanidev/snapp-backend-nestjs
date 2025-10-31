import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptRideDto {
  @ApiProperty({
    description: 'Ride ID to accept',
    example: 'ride-123',
  })
  @IsNotEmpty()
  @IsString()
  rideId: string;
}

