import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";


export class UpdateLocationDto {
    @ApiProperty({description:'latitude'})
    @IsString() 
    @IsNotEmpty()
    @IsLatitude()
    latitude: string;
    @ApiProperty({description:'longitude'})
    @IsString()
    @IsNotEmpty()
    @IsLongitude()
    longitude: string;
}

export class GetNearbyDriversDto {
    @ApiProperty({description:'latitude'})
    @IsString()
    @IsNotEmpty()
    @IsLatitude()
    latitude: string;
    @ApiProperty({description:'longitude'})
    @IsString()
    @IsNotEmpty()
    @IsLongitude()
    longitude: string;
    @ApiProperty({description:'radius'})
    @IsNumberString()
    @IsNotEmpty()
    radius: number;
}