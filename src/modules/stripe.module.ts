import { StripeControllerWebhook } from '@/main/shared/stripe/stripe.controller';
import { StripeModule } from '@/main/shared/stripe/stripe.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [StripeModule],
  controllers: [StripeControllerWebhook],
})
export class StripeHookModule {}
