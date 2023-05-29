import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class ResponseMessageBase {
  @Field({ nullable: true })
  success: boolean;

  @Field({ nullable: true })
  message: string;
}
