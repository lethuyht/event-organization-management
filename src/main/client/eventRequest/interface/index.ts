import { PaginationInterface } from '@/common/interfaces/pagination';
import { EventRequest } from '@/db/entities/EventRequest';
import { ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class IEventRequest extends EventRequest {}

@ObjectType({ isAbstract: true })
export class IEventRequests extends PaginationInterface<IEventRequest>(
  IEventRequest,
) {}
