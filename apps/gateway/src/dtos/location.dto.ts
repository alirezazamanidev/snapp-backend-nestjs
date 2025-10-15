import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from "class-validator";


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