import { PaginationInterface } from '@/common/interfaces/pagination';
import { Service } from '@/db/entities/Service';
import { ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class IService extends Service {}

@ObjectType({ isAbstract: true })
export class IServices extends PaginationInterface(IService) {}
