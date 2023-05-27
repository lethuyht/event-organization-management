import { CustomBaseEntity } from '@/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({ isAbstract: true })
@Entity('role')
export class Role extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
