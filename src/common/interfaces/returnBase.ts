import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class ResponseMessageBase {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
