import { ServiceType } from '@/db/entities/Service';
import { ServiceItem } from '@/db/entities/ServiceItem';
import { EntityExistingValidator } from '@/decorators/entityExistingValidator.decorator';
import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Validate,
  ValidateNested,
  IsBoolean,
} from 'class-validator';

@InputType()
export class UpsertServiceDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(EntityExistingValidator, ['service'])
  id: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  detail: string;

  @Field(() => ServiceType, { nullable: true })
  type: ServiceType;

  @Field(() => [UpsertServiceItemDto], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => UpsertServiceItemDto)
  serviceItems: ServiceItem[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished: boolean;
}

@InputType()
export class UpsertServiceItemDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(EntityExistingValidator, ['service_item'])
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => Float, { nullable: true })
  price: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  totalQuantity: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished: boolean;
}

@InputType()
export class PublishServiceItemDto {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean, { defaultValue: true })
  isPublished: boolean;
}

@InputType()
export class PublishServiceDto {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean, { defaultValue: true })
  isPublished: boolean;

  @Field(() => [PublishServiceItemDto])
  @ValidateNested({ each: true })
  @Type(() => PublishServiceDto)
  serviceItems: ServiceItem[];
}
