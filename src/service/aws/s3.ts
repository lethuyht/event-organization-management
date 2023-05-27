import { HttpException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import internal from 'stream';
import { configuration } from '../../config';

export class S3Adapter {
  bucket: string;
  s3: S3;

  constructor() {
    this.bucket = configuration.aws.s3BucketName;
    this.s3 = new S3({
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
      secretAccessKey: configuration.aws.secretKey,
      accessKeyId: configuration.aws.accessKey,
      region: configuration.aws.region,
      params: { Bucket: this.bucket },
    });
  }

  async deleteFile(url: string) {
    const words = url.split('/');
    return await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: words[words.length - 1],
      })
      .promise();
  }

  getSignedUrl({
    pathFile,
    fileType,
  }: {
    pathFile: string;
    fileType: string;
  }): Promise<string> {
    const s3Params = {
      Bucket: this.bucket,
      Key: pathFile,
      ACL: 'public-read',
      ContentType: fileType,
      Expires: 5 * 60, //time to expire in seconds (6 minutes)
    };
    try {
      return new Promise((resolve, reject) => {
        this.s3.getSignedUrl('putObject', s3Params, (err, url) => {
          if (err) {
            reject(err);
          } else {
            resolve(url);
          }
        });
      });
    } catch (err) {
      throw new HttpException(err, 404);
    }
  }

  async getObjectStream(key: string): Promise<internal.Readable> {
    const s3Params = {
      Bucket: this.bucket,
      Key: key,
    };
    try {
      return this.s3.getObject(s3Params).createReadStream();
    } catch (err) {
      console.log('s3 getObject stream failed');
      throw new Error(err);
    }
  }

  upload(buffer: any, key: string, type: string): Promise<string> {
    const s3Params = {
      Key: key,
      Body: buffer,
      Bucket: this.bucket,
      ContentEncoding: 'base64',
      ACL: 'public-read',
      ContentType: type,
    };
    try {
      return new Promise((resolve, reject) => {
        this.s3.upload(s3Params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } catch (err) {
      console.log('s3 upload failed');
      throw new Error(err);
    }
  }
}
