import { Injectable, NotFoundException } from '@nestjs/common';

import { getPaginationResponse } from '@/common/base/getPaginationResponse';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Role } from '@/db/entities/Role';

@Injectable()
export class RoleService {
  async getOne(id: string) {
    const role = await Role.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
  async getAll(queryParams: QueryFilterDto) {
    const builder = Role.createQueryBuilder('Role');
    return await getPaginationResponse(builder, queryParams);
  }
}
