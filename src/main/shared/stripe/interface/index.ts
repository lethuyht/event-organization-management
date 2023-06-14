import { Field, ObjectType } from '@nestjs/graphql';
import { Request } from 'express';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}
export interface RequestInfo {
  callbackUrl: string;
}

@ObjectType({ isAbstract: true })
export class CheckoutStripeResponse {
  @Field()
  checkoutUrl: string;

  @Field()
  successUrl: string;

  @Field()
  cancelUrl: string;
}
