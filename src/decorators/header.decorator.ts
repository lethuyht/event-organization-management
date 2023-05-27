import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Headers = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return key ? request.headers?.[key] : request.headers;
  },
);
