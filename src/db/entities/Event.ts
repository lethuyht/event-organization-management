import { CustomBaseEntity } from '@/common/base/baseEntity';
import { getJoinRelation } from '@/providers/selectionUtils';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventServiceItem } from './EventServiceItem';

@ObjectType({ isAbstract: true })
@Entity('event')
export class Event extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  thumbnail: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  detail: string;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false, type: 'boolean' })
  isPublic: boolean;

  @Field(() => [EventServiceItem], { nullable: true })
  @OneToMany(() => EventServiceItem, (et) => et.event, { cascade: true })
  eventServiceItems: EventServiceItem[];

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [
      ['eventServiceItems'],
      ['eventServiceItems', 'serviceItem'],
    ];

    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
