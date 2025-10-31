import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class InvalidateSessionDto {
  @ApiProperty({
    description: 'The session ID',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;
}
