import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContractEvent } from './ContractEvent';
import { ServiceItem } from './ServiceItem';

@ObjectType({ isAbstract: true })
@Entity({ name: 'contract_event_service_item' })
export class ContractEventServiceItem extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => ID)
  @Column()
  contractEventId: string;

  @Field(() => ID)
  @Column()
  serviceItemId: string;

  @Field(() => Int)
  @Column()
  amount: number;

  @Field()
  @Column()
  price: number;

  @Field(() => ContractEvent)
  @ManyToOne(() => ContractEvent)
  @JoinColumn({ name: 'contract_event_id' })
  contractEvent: ContractEvent;

  @Field(() => ServiceItem)
  @ManyToOne(() => ServiceItem)
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: ServiceItem;
}
