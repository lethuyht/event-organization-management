import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class IPreSignUrl {
  @Field()
  pathFile: string;

  @Field()
  fileType: string;

  @Field()
  uploadUrl: string;
}
