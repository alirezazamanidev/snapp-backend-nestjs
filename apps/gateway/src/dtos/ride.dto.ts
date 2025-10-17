import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RequestRideDto {
 
    @IsNotEmpty()
    @IsString()
    pickupLocation: string

    @IsNotEmpty()
    @IsString()
    destinationLocation: string
}