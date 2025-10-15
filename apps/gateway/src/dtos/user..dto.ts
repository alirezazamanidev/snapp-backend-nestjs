import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserRoleDto {
    @ApiProperty({
        description: 'The role of the user',
        enum:[Role.USER, Role.DRIVER],
        example: Role.USER,
    })
    @IsEnum([Role.USER, Role.DRIVER])
    @IsNotEmpty()
    role: Role.USER | Role.DRIVER;
}

export class CreateOrUpdateDriverProfileDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    carPlateNumber: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    carModel: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    carColor: string;
}