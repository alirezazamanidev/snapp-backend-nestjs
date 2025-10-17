
import { IsNotEmpty, IsString } from "class-validator";

export class RequestRideDto {
 
    @IsNotEmpty()
    @IsString()
    pickupLocation: string

    @IsNotEmpty()
    @IsString()
    destinationLocation: string
}
export class CalculateRideDto {
  @IsNotEmpty()
  @IsString()
  pickupLocation: string

  @IsNotEmpty()
  @IsString()
  destinationLocation: string
}