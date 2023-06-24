import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './Event';
import { ServiceItem } from './ServiceItem';

@ObjectType({ isAbstract: true })
@Entity('event_service_item')
export class EventServiceItem extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => ID)
  @Column()
  eventId: string;

  @Field(() => ID)
  @Column()
  serviceItemId: string;

  @Field(() => Int)
  @Column()
  amount: number;

  @Field(() => Event)
  @ManyToOne(() => Event, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Field(() => ServiceItem)
  @ManyToOne(() => ServiceItem, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: ServiceItem;
}
