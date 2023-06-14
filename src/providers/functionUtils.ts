import { readdirSync, statSync } from 'fs';
import _, { random } from 'lodash';
import { nanoid } from 'nanoid';
import { join } from 'path';
import slug from 'slug';
import { S3Adapter } from '../service/aws/s3';

export const getFileName = (fileName: string) => {
  const index = fileName.indexOf('.');
  const file = slug(fileName.substring(0, index));
  const extension = fileName.substring(index);
  return `${new Date().getTime()}-${file}${extension}`;
};

export const randomCode = () => {
  //output '1492341545873'
  let now = Date.now().toString();
  now += now + Math.floor(Math.random() * 10);
  return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('');
};

export const getRandomToken = function () {
  return nanoid(64);
};

export const randomSpecialChar = function () {
  const specialCharacters = '#?!@$%^&*-';
  const index = Math.floor((specialCharacters.length - 1) * Math.random());
  return specialCharacters.substring(index, index + 1);
};

export const generatePassword = function () {
  const randomString = String(random(30000, 9999));
  return `EdLuma${randomSpecialChar()}${randomString}`;
};

export const isNil = function (obj: any) {
  return obj === null || obj === undefined;
};

export const isEmpty = function (obj: any) {
  return (
    [Object, Array].includes((obj || {}).constructor) &&
    !Object.entries(obj || {}).length
  );
};

export const isNilOrEmpty = function (obj: any) {
  return isNil(obj) || isEmpty(obj);
};

export const compactObject = <T extends Record<string, any>>(
  object: T | undefined,
): T => {
  if (!object) return null;

  return Object.entries(object).reduce(
    (acc: Record<string, any>, [key, value]: [string, any]) => {
      const newAcc = Object.assign({}, acc);

      if (!isNil(value)) {
        newAcc[key] = value;
      }

      return newAcc;
    },
    {},
  ) as T;
};

export interface UploadFileToS3Dto {
  data: any;
  fileName: string;
  pathType: string;
  fileType: string;
}

export const uploadFileToS3 = async (
  { data, pathType, fileName, fileType }: UploadFileToS3Dto,
  addTimeToKey = true,
) => {
  const S3 = new S3Adapter();
  const key = `${pathType}/${addTimeToKey ? `${Date.now()}-` : ''}${fileName}`;
  const uploadData = await S3.upload(data, key, fileType);

  return uploadData;
};

export const getFilePathsFromFolder = (dir: string) => {
  try {
    const filePaths = [];

    readdirSync(dir).forEach((fileName) => {
      const filePath = join(dir, fileName);
      const stat = statSync(filePath);

      if (stat.isFile()) {
        filePaths.push(filePath);
      }

      if (stat.isDirectory()) {
        const subFilePaths = getFilePathsFromFolder(filePath);
        filePaths.push(subFilePaths);
      }
    });

    return _.flattenDeep(filePaths);
  } catch (error) {
    console.log('Get file paths from folder error');
    throw new Error(error);
  }
};
