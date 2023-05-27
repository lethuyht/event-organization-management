import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { DeleteFileDto, PresignedUrlDto } from './dto';
import { IPreSignUrl } from './interface';
import { UploadService } from './upload.service';

import { Auth } from '@/decorators/auth.decorator';
import { Context, GetContext } from '@/decorators/user.decorator';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Auth()
  @Mutation(() => IPreSignUrl)
  async presignedUrlS3(
    @Args('presignedUrlDto') presignedUrlDto: PresignedUrlDto,
    @GetContext() ctx: Context,
  ): Promise<IPreSignUrl> {
    const { currentUser } = ctx;
    return await this.uploadService.presignedUrlS3(
      currentUser.id,
      presignedUrlDto,
    );
  }

  @Mutation(() => String)
  async deleteFileS3(
    @Args('deleteFileDto') deleteFileDto: DeleteFileDto,
  ): Promise<string> {
    return await this.uploadService.deleteFileS3(deleteFileDto);
  }

  @Query(() => String)
  async testQuery() {
    return 'DONE';
  }

  @Mutation(() => IPreSignUrl)
  async presignedUrlS3Public(
    @Args('presignedUrlDto') presignedUrlDto: PresignedUrlDto,
  ): Promise<IPreSignUrl> {
    return await this.uploadService.presignedUrlS3Public(presignedUrlDto);
  }
}
