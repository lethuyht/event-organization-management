import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../db/entities/User';

import { CACHE_NAMESPACE, RedisClientSingleton } from '../service/aws/redis';
import { AuthenticationError } from 'apollo-server-express';

export interface Context {
  currentUser: User; //Later change to User type
  IPAddress?: string;
  AccessToken: string;
  Platform: string;
}

export const GetContext = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);

    const {
      req: {
        user,
        headers: { authorization, platform },
      },
    } = ctx.getContext();

    // TODO: Implementing get user

    const currentUser = await RedisClientSingleton.getInstance().get(
      CACHE_NAMESPACE.PersonContext,
      user.email,
      async () =>
        await User.findOne({
          where: { email: user.email },
        }),
      10,
    );

    if (!currentUser) {
      throw new AuthenticationError(
        `You do not have a valid authorised account to use this application. Please contact Admin for more information.`,
      );
    }

    return {
      currentUser,
      AccessToken: authorization,
      Platform: platform,
    };
  },
);
