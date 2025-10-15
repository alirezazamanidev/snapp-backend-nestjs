import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RequestRideDto {
    @ApiProperty({ description: 'The pickup location' })
    @IsNotEmpty()
    @IsString()
    pickupLocation: string

    @ApiProperty({ description: 'The destination location' })
    @IsNotEmpty()
    @IsString()
    destinationLocation: string
}