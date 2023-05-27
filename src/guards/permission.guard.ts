import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this._reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    ) as string[];
    console.log('🚀 ~ permissions', permissions);

    // const ctx = GqlExecutionContext.create(context);
    // const {
    //   req: {
    //     apiGateway: {
    //       event: {
    //         requestContext: {
    //           authorizer: { claims }
    //         }
    //       }
    //     }
    //   }
    // } = ctx.getContext();

    // const user = await User.findOne({ where: { email: claims.email } });
    // if (!user) {
    //   return false;
    // }

    // const userRoles = await UserRole.find({ where: { userId: user.id } });
    // const userPermissions = await RolePermission.find({
    //   where: {
    //     roleId: In(userRoles.map(item => item.roleId))
    //   },
    //   relations: ['permission']
    // });

    // const permissionsDB = userPermissions.map(item => item.permission.name);

    // return permissions.every(permission => permissionsDB.includes(permission));

    return true;
  }
}
