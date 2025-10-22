import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Role as RoleEnum } from '@app/common';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const requiredRole = this.reflector.getAllAndOverride<RoleEnum>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if(!requiredRole) return false;
      const request=context.switchToHttp().getRequest<Request>();
      console.log(request.user.role, requiredRole);
      return request.user.role === requiredRole;
  }
}
