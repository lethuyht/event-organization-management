import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Service } from './Service';
import { GraphQLResolveInfo } from 'graphql';
import { getJoinRelation } from '@/providers/selectionUtils';

@ObjectType({ isAbstract: true })
@Entity('service_item')
export class ServiceItem extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Float)
  @Column()
  price: number;

  @Field()
  @Column()
  totalQuantity: number;

  @Field(() => ID)
  @Column()
  serviceId: string;

  @Field(() => Boolean)
  @Column()
  isPublished: boolean;

  @Field(() => Service)
  @ManyToOne(() => Service, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Field(() => [String])
  @Column({ type: 'text', array: true, nullable: true, default: [] })
  images: string[];

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [['service']];

    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
