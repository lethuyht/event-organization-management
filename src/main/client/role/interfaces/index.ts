import { PaginationInterface } from '@/common/interfaces/pagination';
import { Role } from '@/db/entities/Role';
import { ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class IRole extends Role {}

@ObjectType({ isAbstract: true })
export class IRoles extends PaginationInterface<IRole>(IRole) {}
