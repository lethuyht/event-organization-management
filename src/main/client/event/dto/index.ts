import { EntityExistingValidator } from '@/decorators/entityExistingValidator.decorator';
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, Validate } from 'class-validator';

@InputType()
export class UpsertEventDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(EntityExistingValidator, ['event'])
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description: string;

  @Field({ nullable: true })
  @IsOptional()
  detail: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;
}
