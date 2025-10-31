import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrUpdateDriverProfileDto {
  @ApiProperty({
    description: 'Car plate number',
    example: '12ABC345',
  })
  @IsNotEmpty()
  @IsString()
  carPlateNumber: string;

  @ApiProperty({
    description: 'Car model',
    example: 'Pride',
  })
  @IsNotEmpty()
  @IsString()
  carModel: string;

  @ApiProperty({
    description: 'Car color',
    example: 'White',
  })
  @IsNotEmpty()
  @IsString()
  carColor: string;
}

