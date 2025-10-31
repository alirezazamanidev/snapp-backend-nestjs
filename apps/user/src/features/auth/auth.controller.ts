import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  type IGoogleLoginRequest,
  type IGoogleLoginResponse,
  type IInvalidateAllSessionsRequest,
  type IInvalidateSessionRequest,
  type IValidateSessionRequest,
  IValidateSessionResponse,
} from '@app/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'googleLogin')
  async googleLogin(
    payload: IGoogleLoginRequest,
  ): Promise<IGoogleLoginResponse> {
    return this.authService.googleLogin(payload);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'validateSession')
  async validateSession(
    payload: IValidateSessionRequest,
  ): Promise<IValidateSessionResponse> {
    return this.authService.validateSession(payload);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'invalidateSession')
  async invalidateSession(payload: IInvalidateSessionRequest) {
    return this.authService.invalidateSession(payload);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'invalidateAllSessions')
  async invalidateAllSessions(payload: IInvalidateAllSessionsRequest) {
    return this.authService.invalidateAllSessions(payload);
  }
}

