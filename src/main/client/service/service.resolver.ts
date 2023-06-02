import { Auth } from '@/decorators/auth.decorator';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IService, IServices } from './interface';
import { UpsertServiceDto } from './dto';
import { ServiceService } from './service.service';
import { Roles } from '@/decorators/roles.decorator';
import { ROLE } from '@/common/constant';
import { QueryFilterDto } from '@/common/dtos/queryFilter';

@Auth(['Roles'])
@Resolver()
export class ServiceResolver {
  constructor(private service: ServiceService) {}

  @Roles(ROLE.Admin)
  @Mutation(() => IService, { name: 'upsertService' })
  upsertService(@Args('input') input: UpsertServiceDto) {
    return this.service.upsertService(input);
  }

  @Query(() => IServices)
  getServices(@Args('query') query: QueryFilterDto) {
    return this.service.getServices(query);
  }

  @Query(() => IService)
  getService(@Args('id') id: string) {
    return this.service.getService(id);
  }
}
