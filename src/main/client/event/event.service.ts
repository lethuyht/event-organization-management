import { Injectable } from '@nestjs/common';
import { GetEventQuery } from './query/getEvent.query';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Event } from '@/db/entities/Event';
import {
  getPaginationResponse,
  createFilterQueryBuilder,
} from '@/common/base/getPaginationResponse';
import { UpsertEventDto } from './dto';
import { GraphQLResolveInfo } from 'graphql';
import { getOneBase } from '@/common/base/getOne';

@Injectable()
export class EventService {
  async getOne(id: string, info: GraphQLResolveInfo) {
    return await getOneBase(Event, id, true, info, 'sự kiện');
  }

  async getAll(queryParams: QueryFilterDto, info: GraphQLResolveInfo) {
    const builder = createFilterQueryBuilder(Event, queryParams, info);
    return await getPaginationResponse(builder, queryParams);
  }

  async upsertEvent(input: UpsertEventDto) {
    const { id, name, description } = input;

    const event = await GetEventQuery.getOneById(id, false);

    if (!event && (!name || !description)) {
      throw new Error('Vui lòng nhập tên và mô tả sự kiện');
    }

    const newEvent = Event.merge(event ?? Event.create(), input);

    await Event.save(newEvent);

    return Event.findOne({
      where: { id: newEvent.id },
      relations: ['eventServiceItems', 'eventServiceItems.serviceItem'],
    });
  }
}
