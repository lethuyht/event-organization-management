import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class RequestContractDto {
  @Field(() => [ID])
  cartItemIds: string[];

  @Field()
  address: string;
}
