import { EventRequestStatus } from '@/db/entities/EventRequest';
import { EntityExistingValidator } from '@/decorators/entityExistingValidator.decorator';
import { Field, ID, InputType, PickType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsOptional,
  IsPositive,
  Validate,
  ValidateNested,
} from 'class-validator';

@InputType()
export class EventRequestDetailInput {
  @Field({ nullable: true })
  @IsOptional()
  customerName: string;

  @Field({ nullable: true })
  @IsOptional()
  phoneNumber: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsPositive()
  amountAttendee: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  startHireDate: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endHireDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  address: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isAcceptedComboService: boolean;
}

@InputType()
export class UpsertEventRequestInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(EntityExistingValidator, ['event_request'])
  id: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(EntityExistingValidator, ['event'])
  eventId: string;

  @Field(() => EventRequestStatus, { nullable: true })
  @IsOptional()
  @IsIn(Object.values(EventRequestStatus))
  status: EventRequestStatus;

  @Field(() => EventRequestDetailInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventRequestDetailInput)
  eventRequestDetail: EventRequestDetailInput;
}

@InputType()
export class UpdateEventRequestStatusByAdminInput extends PickType(
  UpsertEventRequestInput,
  ['id', 'status'],
) {}
