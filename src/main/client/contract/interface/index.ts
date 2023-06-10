import { PaginationInterface } from '@/common/interfaces/pagination';
import { Contract } from '@/db/entities/Contract';
import { ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class IContract extends Contract {}

@ObjectType({ isAbstract: true })
export class IContracts extends PaginationInterface(IContract) {}
