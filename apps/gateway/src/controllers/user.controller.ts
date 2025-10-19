import {
  IUserService,
  Role,
  USER_PACKAGE_NAME,
  USER_SERVICE_NAME,
} from '@app/common';
import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateOrUpdateDriverProfileDto, UpdateUserRoleDto } from '../dtos/user..dto';
import type { Request } from 'express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { SwaggerConsumes } from '../common/enums/swagger.enum';
import { CheckRole } from '../common/decorators/role.decorator';

@Controller('user')
export class UserController implements OnModuleInit {
  private userClientService: IUserService;
  constructor(@Inject(USER_PACKAGE_NAME) private readonly client: ClientGrpc) {}
  onModuleInit() {
    this.userClientService =
      this.client.getService<IUserService>(USER_SERVICE_NAME);
  }
  @Patch('select-role')
  @ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update user role' })
  updateUserRole(@Body() dto: UpdateUserRoleDto, @Req() req: Request) {
    return this.userClientService.updateUserRole({
      sessionId: req.user.sessionId,
      role: dto.role,
    });
  }
  @Post('driver/profile')
  @ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
  @CheckRole(Role.DRIVER)
  @ApiOperation({ summary: 'Create driver profile' })
  createOrUpdateDriverProfile(@Body() dto: CreateOrUpdateDriverProfileDto, @Req() req: Request) {
    return this.userClientService.createOrUpdateDriverProfile({
      userId: req.user.userId,
      carPlateNumber: dto.carPlateNumber,
      carModel: dto.carModel,
      carColor: dto.carColor,
    });
  }
}
