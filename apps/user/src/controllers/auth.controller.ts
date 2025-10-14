import { Controller } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { AUTH_SERVICE_NAME, type IGoogleLoginRequest } from "@app/common";
import { GrpcMethod, Payload } from "@nestjs/microservices";

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @GrpcMethod(AUTH_SERVICE_NAME, 'googleLogin')
    googleLogin(@Payload() payload: IGoogleLoginRequest) {
        return this.authService.googleLogin(payload);
    }
}