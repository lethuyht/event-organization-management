import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CheckoutDto {
  @Field()
  successUrl: string;

  @Field()
  cancelUrl: string;
}

@InputType()
export class DepositContractDto extends CheckoutDto {
  @Field(() => ID)
  contractId: string;
}
