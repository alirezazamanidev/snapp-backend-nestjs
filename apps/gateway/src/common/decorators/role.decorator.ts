import { Role as RoleEnum } from '@app/common';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';

export const ROLES_KEY = 'role';
export const Role = (role: RoleEnum) => SetMetadata(ROLES_KEY, role);

export const CheckRole = (role: RoleEnum) =>
  applyDecorators(Role(role), UseGuards(AuthGuard, RoleGuard));
