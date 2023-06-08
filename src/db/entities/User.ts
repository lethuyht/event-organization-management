import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './Role';

import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Exclude, classToPlain } from 'class-transformer';
import { GraphQLResolveInfo } from 'graphql';
import { getJoinRelation } from '@/providers/selectionUtils';
import { Cart } from './Cart';

@ObjectType({ isAbstract: true })
@Entity('user')
export class User extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @Column()
  avatar: string;

  @Field({ nullable: true })
  @Column()
  phoneNumber: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column()
  firstName: string;

  @Field(() => ID)
  @Column()
  roleId: string;

  @Field()
  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Field()
  @Column()
  email: string;

  @Field(() => Role)
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Field(() => Cart, { nullable: true })
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  toPublic() {
    return classToPlain(this);
  }

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [['role']];

    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
