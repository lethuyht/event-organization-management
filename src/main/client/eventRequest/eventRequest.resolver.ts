import { ROLE } from '@/common/constant';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Auth } from '@/decorators/auth.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { Context, GetContext } from '@/decorators/user.decorator';
import { Args, ID, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  UpdateEventRequestStatusByAdminInput,
  UpsertEventRequestInput,
} from './dto';
import { EventRequestService } from './eventRequest.service';
import { IEventRequest, IEventRequests } from './interface';

@Resolver()
export class EventRequestResolver {
  constructor(protected readonly service: EventRequestService) {}

  @Query(() => IEventRequest, { name: 'getEventRequest' })
  async getEventRequest(
    @Args('id', { type: () => ID }) id: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    return await this.service.getEventRequest(id, info);
  }

  @Query(() => IEventRequests, { name: 'getEventRequests' })
  async getEventRequests(
    @Args('queryParams') queryParams: QueryFilterDto,
    @Info() info: GraphQLResolveInfo,
  ) {
    return await this.service.getEventRequests(queryParams, info);
  }

  @Roles(ROLE.User)
  @Auth(['roles'])
  @Mutation(() => IEventRequest, { name: 'upsertEventRequest' })
  async upsertEventRequest(
    @Args('input') input: UpsertEventRequestInput,
    @GetContext() ctx: Context,
    @Info() info: GraphQLResolveInfo,
  ) {
    return await this.service.upsertEventRequest(
      input,
      info,
      ctx?.currentUser.id,
    );
  }

  @Roles(ROLE.Admin)
  @Auth(['roles'])
  @Mutation(() => IEventRequest, { name: 'updateEventRequestStatusByAdmin' })
  async updateEventStatusByAdmin(
    @Args('input') input: UpdateEventRequestStatusByAdminInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return await this.service.upsertEventRequest(input, info);
  }
}
