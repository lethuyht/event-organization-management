import { Module } from '@nestjs/common';
import { ContractResolver } from './contract.resolver';
import { ContractService } from './contract.service';
import { StripeService } from '@/main/shared/stripe/stripe.service';

@Module({
  providers: [ContractResolver, ContractService, StripeService],
})
export class ContractModule {}
