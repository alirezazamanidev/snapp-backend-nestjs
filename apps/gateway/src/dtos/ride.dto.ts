import type { LatLng } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class DriverOnlineDto {

  @IsNotEmpty()
  @IsObject()
  location: LatLng
}
export class CalculateRideDto {
  @IsNotEmpty()
  @IsString()
  pickupLocation: string

  @IsNotEmpty()
  @IsString()
  destinationLocation: string
}
export class AcceptRideDto {
  @IsNotEmpty()
  @IsString()
  rideId: string
}