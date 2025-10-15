import { Controller, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { GrpcMethod } from '@nestjs/microservices';
import { type ICreateOrUpdateDriverProfileRequest, type IUpdateUserRoleRequest, USER_SERVICE_NAME } from '@app/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_SERVICE_NAME,'updateUserRole')
  updateUserRole(dto: IUpdateUserRoleRequest) {
    return this.userService.updateUserRole(dto);
  }
  @GrpcMethod(USER_SERVICE_NAME,'createOrUpdateDriverProfile')
  createOrUpdateDriverProfile(dto: ICreateOrUpdateDriverProfileRequest) {
    return this.userService.createOrUpdateDriverProfile(dto);
  }
}
