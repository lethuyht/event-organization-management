import { registerEnumType } from '@nestjs/graphql';
import { UserVerificationRequestType } from './UserVerificationRequest';
import { ServiceType } from './Service';
import { CONTRACT_STATUS, CONTRACT_TYPE } from './Contract';
import { EventRequestStatus } from './EventRequest';

registerEnumType(UserVerificationRequestType, {
  name: 'UserVerificationRequestType',
});

registerEnumType(ServiceType, {
  name: 'ServiceType',
});

registerEnumType(CONTRACT_STATUS, {
  name: 'CONTRACT_STATUS',
});

registerEnumType(CONTRACT_TYPE, {
  name: 'CONTRACT_TYPE',
});
registerEnumType(EventRequestStatus, { name: 'EventRequestStatus' });
