import { ObjectType, PickType } from '@nestjs/graphql';

import { User } from '@/db/entities/User';
import { PaginationInterface } from '@/common/interfaces/pagination';

@ObjectType({ isAbstract: true })
export class IUser extends PickType(User, [
  'id',
  'avatar',
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'role',
  'roleId',
  'createdAt',
  'updatedAt',
]) {}

@ObjectType({ isAbstract: true })
export class IUsers extends PaginationInterface<IUser>(IUser) {}
