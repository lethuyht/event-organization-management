import { Args, ID, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventService } from './event.service';
import { IEvent, IEvents } from './interface';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Auth } from '@/decorators/auth.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { ROLE } from '@/common/constant';
import { EventRequestInput, UpsertEventDto } from './dto';
import { GraphQLResolveInfo } from 'graphql';
import { ResponseMessageBase } from '@/base/interface';
import { GetContext, Context } from '@/decorators/user.decorator';
import { IContract } from '../contract/interface';

@Resolver()
export class EventResolver {
  constructor(protected service: EventService) {}

  @Query(() => IEvent, { name: 'getEvent' })
  async getEvent(
    @Args('id', { type: () => ID }) id: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    return await this.service.getOne(id, info);
  }

  @Query(() => IEvents, { name: 'getEvents' })
  async getEvents(
    @Args('queryParams')
    queryParams: QueryFilterDto,
    @Info() info: GraphQLResolveInfo,
  ) {
    return await this.service.getAll(queryParams, info);
  }

  @Auth()
  @Roles(ROLE.Admin)
  @Mutation(() => IEvent, { name: 'upsertEvent' })
  async upsertEvent(@Args('input') input: UpsertEventDto) {
    return await this.service.upsertEvent(input);
  }

  @Auth()
  @Roles(ROLE.User)
  @Mutation(() => IContract, { name: 'createEventRequest' })
  async createEventRequest(
    @Args('input') input: EventRequestInput,
    @GetContext() ctx: Context,
  ) {
    return this.service.createEventRequest(input, ctx.currentUser);
  }

  @Auth()
  @Roles(ROLE.Admin)
  @Mutation(() => ResponseMessageBase, { name: 'deleteEvent' })
  async deleteEvent(@Args('id') id: string) {
    return this.service.deleteEvent(id);
  }
}
