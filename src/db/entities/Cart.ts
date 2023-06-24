import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { CartItem } from './CartItem';
import { GraphQLResolveInfo } from 'graphql';
import { getJoinRelation } from '@/providers/selectionUtils';

@ObjectType({ isAbstract: true })
@Entity('cart')
export class Cart extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => ID)
  @Column()
  userId: string;

  @Field(() => User)
  @JoinColumn({ name: 'user_id' })
  @OneToOne(() => User, (user) => user.id)
  user: User;

  @Field(() => [CartItem], { nullable: true })
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  cartItems: CartItem[];

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [
      ['cartItems'],
      ['cartItems', 'serviceItem'],
      ['cartItems', 'serviceItem', 'service'],
    ];
    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
