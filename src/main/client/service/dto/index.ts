import { ServiceType } from '@/db/entities/Service';
import { ServiceItem } from '@/db/entities/ServiceItem';
import { EntityExistingValidator } from '@/decorators/entityExistingValidator.decorator';
import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Validate, ValidateNested } from 'class-validator';

@InputType()
export class UpsertServiceDto {
  @Field(() => ID, { nullable: true })
  @Validate(EntityExistingValidator, ['service'])
  id: string;

  @Field(() => [String])
  images: string[];

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => ServiceType)
  type: ServiceType;

  @Field(() => [UpsertServiceItemDto], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => UpsertServiceItemDto)
  serviceItems: ServiceItem[];
}

@InputType()
export class UpsertServiceItemDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(EntityExistingValidator, ['service_item'])
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  totalQuantity: number;
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
