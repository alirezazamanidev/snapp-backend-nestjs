import { Controller } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { AUTH_SERVICE_NAME, type IValidateSessionRequest, type IGoogleLoginRequest } from "@app/common";
import { GrpcMethod, Payload } from "@nestjs/microservices";
import { SessionService } from "../services/session.service";


@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService,private readonly sessionService:SessionService) {}

    @GrpcMethod(AUTH_SERVICE_NAME, 'googleLogin')
    googleLogin(@Payload() payload: IGoogleLoginRequest) {
        return this.authService.googleLogin(payload);
    }

    @GrpcMethod(AUTH_SERVICE_NAME, 'validateSession')
    validateSession(@Payload() payload: IValidateSessionRequest){
        return this.sessionService.validate(payload.sessionId);
    }
}