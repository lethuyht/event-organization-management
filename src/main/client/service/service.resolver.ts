import { ROLE } from '@/common/constant';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Auth } from '@/decorators/auth.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertServiceDto } from './dto';
import { IService, IServices } from './interface';
import { ServiceService } from './service.service';

@Resolver()
export class ServiceResolver {
  constructor(private service: ServiceService) {}

  @Roles(ROLE.Admin)
  @Auth(['Roles'])
  @Mutation(() => IService, { name: 'upsertService' })
  upsertService(@Args('input') input: UpsertServiceDto) {
    return this.service.upsertService(input);
  }

  @Query(() => IServices)
  getServices(
    @Args('query') query: QueryFilterDto,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.getServices(query, info);
  }

  @Query(() => IService)
  getService(@Args('id') id: string, @Info() info: GraphQLResolveInfo) {
    return this.service.getService(id, info);
  }
}
