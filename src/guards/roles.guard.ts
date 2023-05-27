import { ROLE } from '../common/constant';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this._reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);

    const {
      req: { user },
    } = ctx.getContext();

    return requiredRoles.some((role) => user.role.name === role);
  }
}
