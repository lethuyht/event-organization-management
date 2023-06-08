import { registerEnumType } from '@nestjs/graphql';
import { UserVerificationRequestType } from './UserVerificationRequest';
import { ServiceType } from './Service';
import { EventRequestStatus } from './EventRequest';

registerEnumType(UserVerificationRequestType, {
  name: 'UserVerificationRequestType',
});

registerEnumType(ServiceType, {
  name: 'ServiceType',
});

registerEnumType(EventRequestStatus, { name: 'EventRequestStatus' });
