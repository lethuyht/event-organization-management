import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsUrl } from 'class-validator';

@InputType()
export class UserUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  firstName: string;

  @Field({ nullable: true })
  @IsOptional()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  phoneNumber: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  avatar: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  password: string;

  @Field()
  newPassword: string;
}
