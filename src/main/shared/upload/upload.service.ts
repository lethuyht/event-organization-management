import { Injectable } from '@nestjs/common';
import _ from 'lodash';

import { S3_UPLOAD_TYPE } from '../../../common/constant';
import { configuration } from '../../../config';
import { getFileName } from '../../../providers/functionUtils';

import { DeleteFileDto, PresignedUrlDto } from './dto';
import { IPreSignUrl } from './interface';
import { S3Adapter } from '@/service/aws/s3';

@Injectable()
export class UploadService {
  private s3Adapter: S3Adapter;
  constructor() {
    this.s3Adapter = new S3Adapter();
  }
  async presignedUrlS3(
    userId: string,
    presignedUrlDto: PresignedUrlDto,
  ): Promise<IPreSignUrl> {
    try {
      const { fileName, fileType, pathType } = presignedUrlDto;
      const newFileName = getFileName(fileName);
      const pathFile = `${S3_UPLOAD_TYPE[pathType]}/${userId}/${newFileName}`;

      const uploadUrl = await this.s3Adapter.getSignedUrl({
        pathFile,
        fileType,
      });

      return {
        pathFile,
        fileType,
        uploadUrl,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async deleteFileS3(deleteFileDto: DeleteFileDto): Promise<string> {
    const { url } = deleteFileDto;
    try {
      await this.s3Adapter.deleteFile(url);
      return 'OK';
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static verifyS3Key = async (url: string) => {
    if (_.includes(url, configuration.aws.region)) {
      throw new Error('Image should not url');
    }
  };

  async presignedUrlS3Public(
    presignedUrlDto: PresignedUrlDto,
  ): Promise<IPreSignUrl> {
    try {
      const { fileName, fileType, pathType } = presignedUrlDto;
      const newFileName = getFileName(fileName);
      const pathFile = `${S3_UPLOAD_TYPE[pathType]}/${newFileName}`;

      const uploadUrl = await this.s3Adapter.getSignedUrl({
        pathFile,
        fileType,
      });

      return {
        pathFile,
        fileType,
        uploadUrl,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
