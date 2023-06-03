import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './Cart';
import { ServiceItem } from './ServiceItem';

@ObjectType({ isAbstract: true })
@Entity('cart_item')
export class CartItem extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => ID)
  @Column()
  cartId: string;

  @Field(() => ID)
  @Column()
  serviceItemId: string;

  @Field(() => Date)
  @Column()
  hireDate: Date;

  @Field(() => Date)
  @Column()
  hireEndDate: Date;

  @Field(() => Number)
  @Column()
  amount: number;

  @Field(() => Cart)
  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Field(() => ServiceItem)
  @ManyToOne(() => ServiceItem)
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: ServiceItem;
}
