import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({ isAbstract: true })
@Entity('event')
export class Event extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false, type: 'boolean' })
  isPublic: boolean;
}
