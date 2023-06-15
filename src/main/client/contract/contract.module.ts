import { Module } from '@nestjs/common';
import { ContractResolver } from './contract.resolver';
import { ContractService } from './contract.service';
import { StripeModule } from '@/main/shared/stripe/stripe.module';

@Module({
  imports: [StripeModule],
  providers: [ContractResolver, ContractService],
})
export class ContractModule {}
