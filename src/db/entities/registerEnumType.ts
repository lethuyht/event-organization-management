import { registerEnumType } from '@nestjs/graphql';
import { UserVerificationRequestType } from './UserVerificationRequest';

registerEnumType(UserVerificationRequestType, {
  name: 'UserVerificationRequestType',
});
