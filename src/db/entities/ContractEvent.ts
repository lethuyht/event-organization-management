import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from './Contract';
import { Event } from './Event';

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
}
