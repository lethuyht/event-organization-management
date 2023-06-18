import { EventServiceItem } from '@/db/entities/EventServiceItem';
import { EntityExistingValidator } from '@/decorators/entityExistingValidator.decorator';
import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';

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

  @Field({ nullable: true })
  @IsOptional()
  thumbnail: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @Field(() => [EventServiceItemInput], { nullable: true })
  @ValidateNested({ each: true })
  @IsOptional()
  eventServiceItems: EventServiceItem[];
}

@InputType()
export class EventServiceItemInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  id: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  serviceItemId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  amount: number;
}
