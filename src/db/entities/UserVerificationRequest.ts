import { CustomBaseEntity } from '@/common/base/baseEntity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GraphQLJSON } from 'graphql-type-json';

export enum UserVerificationRequestType {
  RESET_PASSWORD = 'reset_password',
  EMAIL_VERIFICATION = 'email_verification',
}

@ObjectType({ isAbstract: true })
@Entity('user_verification_request')
export class UserVerificationRequest extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column({ unique: true, nullable: false })
  email: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  data: JSON;

  @Field()
  @Column({ nullable: false })
  code: string;

  @Field()
  @CreateDateColumn()
  expirationTime: Date;

  @Field(() => UserVerificationRequestType)
  @Column({ unique: true, type: 'enum', enum: UserVerificationRequestType })
  type: UserVerificationRequestType;

  @BeforeInsert()
  @BeforeUpdate()
  transformEmail() {
    this.email = this.email.toLowerCase();
  }
}
