import { Controller, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  type ICreateOrUpdateDriverProfileRequest,
  type IGetProfileRequest,
  type IUpdateUserRoleRequest,
  type ICheckDriverProfileRequest,
  USER_SERVICE_NAME,
  type IGetRoleRequest,
} from '@app/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_SERVICE_NAME, 'updateUserRole')
  updateUserRole(dto: IUpdateUserRoleRequest) {
    return this.userService.updateUserRole(dto);
  }
  @GrpcMethod(USER_SERVICE_NAME, 'createOrUpdateDriverProfile')
  createOrUpdateDriverProfile(dto: ICreateOrUpdateDriverProfileRequest) {
    return this.userService.createOrUpdateDriverProfile(dto);
  }
  @GrpcMethod(USER_SERVICE_NAME, 'getProfile')
  getProfile(payload: IGetProfileRequest) {
    return this.userService.getProfile(payload);
  }
  @GrpcMethod(USER_SERVICE_NAME, 'checkDriverProfile')
  checkDriverProfile(payload: ICheckDriverProfileRequest) {
    return this.userService.checkDriverProfile(payload);
  }
  @GrpcMethod(USER_SERVICE_NAME, 'getRole')
  getRole(payload: IGetRoleRequest) {
    return this.userService.getRole(payload);
  }
}
