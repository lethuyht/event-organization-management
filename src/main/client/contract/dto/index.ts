import { Field, ID, InputType } from '@nestjs/graphql';
import { ContractDetail } from '../interface';
import { CustomerInfoDto } from '@/main/shared/user/dto';
import { Type } from 'class-transformer';

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
