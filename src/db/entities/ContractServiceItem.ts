import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from './Contract';
import { ServiceItem } from './ServiceItem';

@ObjectType({ isAbstract: true })
@Entity('contract_service_item')
export class ContractServiceItem extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => ID)
  @Column()
  contractId: string;

  @Field(() => ID)
  @Column()
  serviceItemId: string;

  @Field()
  @Column()
  amount: number;

  @Field()
  @Column()
  price: number;

  @Field()
  @Column()
  hireDate: Date;

  @Field()
  @Column()
  hireEndDate: Date;

  @Field(() => Contract)
  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Field(() => ServiceItem)
  @ManyToOne(() => ServiceItem)
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: ServiceItem;
}
