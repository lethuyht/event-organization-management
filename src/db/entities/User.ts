import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './Role';

import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Exclude, classToPlain } from 'class-transformer';

@ObjectType({ isAbstract: true })
@Entity('user')
export class User extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

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

  toPublic() {
    return classToPlain(this);
  }
}
