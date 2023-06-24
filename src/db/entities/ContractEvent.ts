import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from './Contract';
import { Event } from './Event';
import { ContractEventServiceItem } from './ContractEventServiceItem';

@ObjectType({ isAbstract: true })
@Entity('contract_event')
export class ContractEvent extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => ID)
  @Column()
  eventId: string;

  @Field(() => ID)
  @Column()
  contractId: string;

  @Field(() => Event)
  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Field(() => Contract)
  @OneToOne(() => Contract)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Field(() => [ContractEventServiceItem])
  @OneToMany(() => ContractEventServiceItem, (ct) => ct.contractEvent, {
    cascade: true,
  })
  contractEventServiceItems: ContractEventServiceItem[];
}
