import { Field, ID, InputType } from '@nestjs/graphql';
import { Min } from 'class-validator';

@InputType()
export class AddItemToCartDto {
  @Field(() => ID)
  serviceItemId: string;

  @Field(() => Number, { defaultValue: 0 })
  @Min(0)
  amount: number;

  @Field(() => Date)
  hireDate: Date;

  @Field(() => Date)
  hireEndDate: Date;
}
