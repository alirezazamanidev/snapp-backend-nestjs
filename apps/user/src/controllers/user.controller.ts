import { Controller, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { GrpcMethod } from '@nestjs/microservices';
import { type IUpdateUserRoleRequest, USER_SERVICE_NAME } from '@app/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_SERVICE_NAME,'updateUserRole')
  updateUserRole(dto: IUpdateUserRoleRequest) {
    return this.userService.updateUserRole(dto);
  }
}
