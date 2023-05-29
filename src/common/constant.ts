export const contentTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const APP_ENV = {
  LOCAL: 'local',
  STAGING: 'staging',
  UAT: 'uat',
  RELEASE: 'release',
  TEST: 'test',
};

export enum ROLE {
  Admin = 'Admin',
  User = 'User',
}

export enum S3_UPLOAD_TYPE {
  Public = 'Public',
  Profile = 'Profile',
}

export const EXPIRATION_TIME = {
  VerificationRequest: 5,
};
