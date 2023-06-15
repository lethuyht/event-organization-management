import { Module } from '@nestjs/common';
import { StripeResolver } from './stripe.resolver';
import { StripeService } from './stripe.service';
import { StripeAdapter } from '@/service/stripe';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  providers: [StripeResolver, StripeService, StripeAdapter, SchedulerRegistry],
  exports: [StripeService, StripeAdapter],
})
export class StripeModule {}
