import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { IRole, IRoles } from './interfaces';
import { RoleService } from './role.service';

@Resolver()
export class RoleResolver {
  private service: RoleService;
  constructor(service: RoleService) {
    this.service = service;
  }

  @Query(() => IRole, { name: 'getRole' })
  async getOne(@Args('id', { type: () => ID }) id: string) {
    return await this.service.getOne(id);
  }

  @Query(() => IRoles, { name: 'getRoles' })
  async getAll(
    @Args('queryParams', { type: () => QueryFilterDto })
    queryParams: QueryFilterDto,
  ) {
    return await this.service.getAll(queryParams);
  }
}
