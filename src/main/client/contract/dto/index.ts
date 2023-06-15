import { Field, ID, InputType } from '@nestjs/graphql';
import { ContractDetail } from '../interface';
import { CustomerInfoDto } from '@/main/shared/user/dto';
import { Type } from 'class-transformer';
import { CONTRACT_STATUS } from '@/db/entities/Contract';

@InputType()
export class RequestContractDto {
  @Field(() => [ID])
  cartItemIds: string[];

  @Field()
  address: string;

  @Field(() => ContractDetailDto)
  @Type(() => ContractDetailDto)
  details: ContractDetail;
}

@InputType()
export class ContractDetailDto {
  @Field()
  contractName: string;

  @Field(() => Date, { nullable: true, defaultValue: new Date() })
  contractCreatedDate: Date;

  @Field(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;
}

@InputType()
export class ConfirmContractDeposit {
  @Field(() => ID)
  contractId: string;

  @Field(() => Boolean, { defaultValue: true })
  isApproved: boolean;
}

@InputType()
export class UpdateContractStatusDto {
  @Field(() => ID)
  contractId: string;

  @Field(() => CONTRACT_STATUS)
  status: CONTRACT_STATUS;
}
