import { CustomBaseEntity } from '@/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({ isAbstract: true })
@Entity('user')
export class User extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => ID)
  @Column()
  roleId: string;
}
