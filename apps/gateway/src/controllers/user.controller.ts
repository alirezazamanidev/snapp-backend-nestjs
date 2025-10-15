import { IUserService, USER_PACKAGE_NAME, USER_SERVICE_NAME } from "@app/common";
import { Body, Controller, Inject, OnModuleInit, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { AuthGuard } from "../common/guards/auth.guard";
import { UpdateUserRoleDto } from "../dtos/user..dto";
import type { Request } from "express";
import { ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { SwaggerConsumes } from "../common/enums/swagger.enum";

@Controller('user')
export class UserController implements OnModuleInit {
    private userClientService: IUserService
    constructor(@Inject(USER_PACKAGE_NAME) private readonly client: ClientGrpc) {}
    onModuleInit() {
        this.userClientService = this.client.getService<IUserService>(USER_SERVICE_NAME);
    }
    @Patch('update-user-role')
    @ApiConsumes(SwaggerConsumes.URL_ENCODED,SwaggerConsumes.JSON)
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update user role' })
   
    updateUserRole(@Body() dto: UpdateUserRoleDto,@Req() req: Request) {
        return this.userClientService.updateUserRole({userId: req.user.userId, role: dto.role});
    }
}