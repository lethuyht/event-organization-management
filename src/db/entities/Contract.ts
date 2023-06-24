import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
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
import { GraphQLResolveInfo } from 'graphql';
import { getJoinRelation } from '@/providers/selectionUtils';
import { ContractEvent } from './ContractEvent';

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

  @Field(() => Date, { nullable: true, defaultValue: new Date() })
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

  @Field()
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

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [
      ['user'],
      ['contractServiceItems'],
      ['contractServiceItems', 'serviceItem'],
      ['contractEventRequest'],
    ];
    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
