import { contentTypes, S3_UPLOAD_TYPE } from '@/common/constant';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsIn, IsString, IsUrl } from 'class-validator';

registerEnumType(S3_UPLOAD_TYPE, {
  name: 'S3_UPLOAD_TYPE'
});
@InputType()
export class PresignedUrlDto {
  @Field()
  @IsString()
  fileName: string;

  @Field()
  @IsString()
  @IsIn(contentTypes)
  fileType: string;

  @Field(() => S3_UPLOAD_TYPE)
  @IsString()
  @IsEnum(S3_UPLOAD_TYPE, {
    message: `pathType must be in types: [${Object.values(S3_UPLOAD_TYPE)}]`
  })
  pathType: string;
}

@InputType()
export class DeleteFileDto {
  @Field()
  @IsString()
  @IsUrl()
  url: string;
}
