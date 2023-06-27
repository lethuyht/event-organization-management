import { CustomBaseEntity } from '@/common/base/baseEntity';
import { getJoinRelation } from '@/providers/selectionUtils';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceItem } from './ServiceItem';

export enum ServiceType {
  Device = 'Device',
  HumanResource = 'HumanResource',
}

@ObjectType({ isAbstract: true })
@Entity('service')
export class Service extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'text', array: true, nullable: true, default: [] })
  images: string[];

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  description: string;

  @Field(() => ServiceType)
  @Column({ type: 'enum', enum: ServiceType })
  type: ServiceType;

  @Field({ nullable: true })
  @Column()
  detail: string;

  @Field(() => Boolean)
  @Column()
  isPublished: boolean;

  @Field({ defaultValue: false })
  @Column()
  isUsed: boolean;

  @Field(() => [ServiceItem], { nullable: true })
  @OneToMany(() => ServiceItem, (serviceItem) => serviceItem.service, {
    cascade: true,
  })
  serviceItems: ServiceItem[];

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [['serviceItems']];

    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
