import { Injectable } from '@nestjs/common';
import { GetEventQuery } from './query/getEvent.query';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Event } from '@/db/entities/Event';
import { getPaginationResponse } from '@/common/base/getPaginationResponse';
import { UpsertEventDto } from './dto';

@Injectable()
export class EventService {
  async getOne(id: string) {
    return await GetEventQuery.getOneById(id);
  }

  async getAll(queryParams: QueryFilterDto) {
    const builder = Event.createQueryBuilder('Event').where(
      'Event.isPublic = true',
    );

    return await getPaginationResponse(builder, queryParams);
  }

  async upsertEvent(input: UpsertEventDto) {
    const { id, name, description } = input;

    const event = await GetEventQuery.getOneById(id, false);

    if (!event && (!name || !description)) {
      throw new Error('Vui lòng nhập tên và mô tả sự kiện');
    }

    const newEvent = Event.merge(event ?? Event.create(), input);

    return await newEvent.save();
  }
}
