import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceItem } from './ServiceItem';

export enum ServiceType {
  Device = 'Device',
  HumanResource = 'Human_Resource',
}

@ObjectType({ isAbstract: true })
@Entity('service')
export class Service extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => GraphQLJSON)
  @Column('text', { array: true, default: [] })
  images: JSON;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  description: string;

  @Field(() => ServiceType)
  @Column({ type: 'enum', enum: ServiceType })
  type: ServiceType;

  @Field(() => [ServiceItem], { nullable: true })
  @OneToMany(() => ServiceItem, (serviceItem) => serviceItem.service, {
    cascade: true,
  })
  serviceItems: ServiceItem[];
}
