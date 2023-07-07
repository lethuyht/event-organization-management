import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { ContractServiceItem } from './ContractServiceItem';
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import { getJoinRelation } from '@/providers/selectionUtils';
import { ContractEvent } from './ContractEvent';
import { generateContractCode } from '@/providers/functionUtils';

export enum CONTRACT_TYPE {
  Event = 'Event',
  Service = 'Service',
}

export enum CONTRACT_STATUS {
  Draft = 'Draft',
  DepositPaid = 'DepositPaid',
  InProgress = 'InProgress',
  WaitingPaid = 'WaitingPaid',
  Completed = 'Completed',
  Cancel = 'Cancel',
  AdminCancel = 'AdminCancel',
}

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Accept value as time stamp with timezone in string format',
  parseValue(value) {
    return value;
  },
  serialize(value) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  },
});

@ObjectType({ isAbstract: true })
export class CustomerInfo {
  @Field()
  @Column()
  type: 'company' | 'person';

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  address: string;

  @Field({ nullable: true })
  @Column()
  representative: string;

  @Field()
  @Column()
  phoneNumber: string;
}

@ObjectType({ isAbstract: true })
export class ContractDetail {
  @Field()
  @Column()
  contractName: string;

  @Field(() => DateScalar)
  @Column()
  contractCreatedDate: Date;

  @Field(() => CustomerInfo)
  @Column()
  customerInfo: CustomerInfo;
}

@ObjectType({ isAbstract: true })
@Entity('contract')
export class Contract extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => CONTRACT_TYPE)
  @Column({ type: 'enum', enum: CONTRACT_TYPE })
  type: CONTRACT_TYPE;

  @Field(() => Date)
  @Column()
  hireDate: Date;

  @Field(() => Float)
  @Column()
  totalPrice: number;

  @Field()
  @Column()
  address: string;

  @Field(() => ContractDetail)
  @Column({ type: 'jsonb', default: {} })
  details: ContractDetail;

  @Field({ nullable: true })
  @Column()
  fileUrl: string;

  @Field(() => Date)
  @Column()
  hireEndDate: Date;

  @Field({ nullable: true })
  @Column()
  code: string;

  @Field(() => CONTRACT_STATUS, { defaultValue: CONTRACT_STATUS.Draft })
  @Column({
    type: 'enum',
    enum: CONTRACT_STATUS,
    default: CONTRACT_STATUS.Draft,
  })
  status: CONTRACT_STATUS;

  @Field(() => ID)
  @Column()
  userId: string;

  @Field({ nullable: true })
  @Column()
  refundReceiptUrl: string;

  @Field({ nullable: true })
  @Column()
  paymentIntentId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => ContractEvent, { nullable: true })
  @OneToOne(() => ContractEvent, (ct) => ct.contract, { cascade: true })
  contractEvent: ContractEvent;

  @Field(() => [ContractServiceItem])
  @OneToMany(
    () => ContractServiceItem,
    (contractService) => contractService.contract,
    { cascade: true },
  )
  contractServiceItems: ContractServiceItem[];

  @BeforeInsert()
  generateContractCode() {
    this.code = generateContractCode();
  }

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [
      ['user'],
      ['contractServiceItems'],
      ['contractServiceItems', 'serviceItem'],
      ['contractServiceItems', 'serviceItem', 'service'],
      ['contractEvent'],
      ['contractEvent', 'event'],
      ['contractEvent', 'contractEventServiceItems'],
      ['contractEvent', 'contractEventServiceItems', 'serviceItem'],
      ['contractEvent', 'contractEventServiceItems', 'serviceItem', 'service'],
    ];
    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
