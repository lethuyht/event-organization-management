import { Module } from '@nestjs/common';
import { ContractResolver } from './contract.resolver';
import { ContractService } from './contract.service';
import { StripeModule } from '@/main/shared/stripe/stripe.module';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [StripeModule],
  providers: [ContractResolver, ContractService, SchedulerRegistry],
})
export class ContractModule {}
