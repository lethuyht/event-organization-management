import { CustomBaseEntity } from '@/common/base/baseEntity';
import { getJoinRelation } from '@/providers/selectionUtils';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './Event';
import { User } from './User';
import { EventRequestDetail } from './EventRequestDetail';

export enum EventRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
}

@ObjectType({ isAbstract: true })
@Entity('event_request')
export class EventRequest extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Column()
  eventId: string;

  @Field(() => ID)
  @Column()
  userId: string;

  @Field(() => String)
  @Column()
  status: EventRequestStatus;

  @Field(() => Event)
  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => EventRequestDetail)
  @OneToOne(() => EventRequestDetail, (detail) => detail.eventRequest, {
    cascade: true,
  })
  eventRequestDetail: EventRequestDetail;

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [['event'], ['user'], ['eventRequestDetail']];

    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
