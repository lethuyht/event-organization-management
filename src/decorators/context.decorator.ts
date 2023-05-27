import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isNil } from 'lodash';

export const GetRequiredContext = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const headers =
      GqlExecutionContext.create(context).getContext().req?.headers;
    if (isNil(headers[data])) {
      throw new BadRequestException(`${data} not found`);
    }
    return headers[data];
  },
);
