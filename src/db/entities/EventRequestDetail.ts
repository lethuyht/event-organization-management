import { CustomBaseEntity } from '@/common/base/baseEntity';
import { getJoinRelation } from '@/providers/selectionUtils';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventRequest } from './EventRequest';

@ObjectType({ isAbstract: true })
@Entity('event_request_detail')
export class EventRequestDetail extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Column()
  eventRequestId: string;

  @Field({ nullable: true })
  @Column()
  customerName: string;

  @Field({ nullable: true })
  @Column()
  phoneNumber: string;

  @Field(() => Number)
  @Column()
  amountAttendee: number;

  @Field(() => Date)
  @Column()
  startHireDate: Date;

  @Field(() => Date)
  @Column()
  endHireDate: Date;

  @Field({ nullable: true })
  @Column()
  address: string;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false, type: 'boolean' })
  isAcceptedComboService: boolean;

  @Field(() => EventRequest)
  @OneToOne(() => EventRequest)
  @JoinColumn({ name: 'event_request_id' })
  eventRequest: EventRequest;

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [['eventRequest']];

    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
