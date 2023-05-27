import { IS_PUBLIC_KEY, PublicOptions } from '../decorators/public.decorator';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  canActivate(context: ExecutionContext) {
    // Check public api with notation @Public()
    const publicMode = this.reflector.getAllAndOverride<PublicOptions>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (publicMode && publicMode.keepAuthorized === false) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.log('🚀 ~ info', info?.name);
      if (info?.name === 'TokenExpiredError') {
        // return expire msg for fresh token, update later
        throw new UnauthorizedException(info);
      }
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
