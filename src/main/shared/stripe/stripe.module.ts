import { Module } from '@nestjs/common';
import { StripeResolver } from './stripe.resolver';
import { StripeService } from './stripe.service';
import { StripeAdapter } from '@/service/stripe';

@Module({
  providers: [StripeResolver, StripeService, StripeAdapter],
  exports: [StripeService, StripeAdapter],
})
export class StripeModule {}
