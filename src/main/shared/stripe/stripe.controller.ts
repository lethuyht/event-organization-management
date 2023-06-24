import { WEBHOOK_TYPE } from '@/common/constant';
import { Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { RequestWithRawBody } from './interface';
import { StripeService } from './stripe.service';

@Controller('/stripe-webhooks')
export class StripeControllerWebhook {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/polaris-account')
  @HttpCode(200)
  connectStripeFluffyAccountWebhooks(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
  ) {
    return this.stripeService.handleConnectWebhooks(
      signature,
      request,
      WEBHOOK_TYPE.POLARIS_ACCOUNT,
    );
  }
}
