import { getJoinRelation } from '@/providers/selectionUtils';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType({ isAbstract: true })
export class CustomBaseEntity extends BaseEntity {
  @Field({ nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  updateTimestampBeforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  updateTimestampBeforeUpdate() {
    this.updatedAt = new Date();
  }

  static getRelations(
    info: GraphQLResolveInfo,
    withPagination?: boolean,
    forceInclude?: string[],
  ): string[] {
    const fields = [];

    return getJoinRelation(info, fields, withPagination, forceInclude);
  }
}
