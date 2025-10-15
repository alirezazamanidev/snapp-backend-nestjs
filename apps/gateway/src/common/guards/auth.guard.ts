import { AUTH_SERVICE_NAME, IAuthService, USER_PACKAGE_NAME } from "@app/common";
import { CanActivate, ExecutionContext, Inject, Injectable, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { Request } from "express";
import { lastValueFrom } from "rxjs";
@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {

    private authClientService: IAuthService
    constructor(@Inject(USER_PACKAGE_NAME) private readonly client: ClientGrpc) {}
    onModuleInit() {
        this.authClientService = this.client.getService<IAuthService>(AUTH_SERVICE_NAME);
    }

    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const request = context.switchToHttp().getRequest<Request>();
        const sessionId = request.cookies['snapp-session'];
        if(!sessionId) throw new UnauthorizedException('Session ID is required');
        const result = await lastValueFrom(this.authClientService.validateSession({sessionId}));
        if(!result) throw new UnauthorizedException('Invalid session ID');
        request.user = result
        return true;
    }
}