import { PaginationInterface } from '@/common/interfaces/pagination';
import { Event } from '@/db/entities/Event';
import { ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class IEvent extends Event {}

@ObjectType({ isAbstract: true })
export class IEvents extends PaginationInterface<IEvent>(IEvent) {}
