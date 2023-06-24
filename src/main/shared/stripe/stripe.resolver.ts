import { Auth } from '@/decorators/auth.decorator';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { StripeService } from './stripe.service';
import { DepositContractDto } from './dto';
import { CheckoutStripeResponse } from './interface';
import { Context, GetContext } from '@/decorators/user.decorator';

@Auth(['Roles'])
@Resolver()
export class StripeResolver {
  constructor(private stripeService: StripeService) {}

  @Query(() => CheckoutStripeResponse)
  depositContract(
    @Args('input') input: DepositContractDto,
    @GetContext() ctx: Context,
  ) {
    return this.stripeService.depositContract(input, ctx.currentUser);
  }
}
