import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({ isAbstract: true })
@Entity('token')
export class Token extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => ID)
  @Column()
  userId: string;

  @Field({ nullable: true })
  @Column()
  accessToken: string;

  @Field({ nullable: true })
  @Column()
  refreshToken: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  lastUsed: Date;
}
