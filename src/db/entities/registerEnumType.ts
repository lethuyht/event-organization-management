import { registerEnumType } from '@nestjs/graphql';
import { UserVerificationRequestType } from './UserVerificationRequest';
import { ServiceType } from './Service';

registerEnumType(UserVerificationRequestType, {
  name: 'UserVerificationRequestType',
});

registerEnumType(ServiceType, {
  name: 'ServiceType',
});
