import { getOneBase } from '@/common/base/getOne';
import {
  createFilterQueryBuilder,
  getPaginationResponse,
} from '@/common/base/getPaginationResponse';
import { EventRequest } from '@/db/entities/EventRequest';
import { Injectable } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertEventRequestInput } from './dto';
import { getManager } from 'typeorm';

@Injectable()
export class EventRequestService {
  async getEventRequest(id: string, info: GraphQLResolveInfo) {
    return await getOneBase(EventRequest, id, true, info, 'yêu cầu sự kiện');
  }

  async getEventRequests(queryParams, info: GraphQLResolveInfo) {
    const builder = createFilterQueryBuilder(EventRequest, queryParams, info);
    return await getPaginationResponse(builder, queryParams);
  }

  async upsertEventRequest(
    input: Partial<UpsertEventRequestInput>,
    info: GraphQLResolveInfo,
    userId?: string,
  ) {
    return await getManager().transaction(async (transaction) => {
      const { id } = input;
      let eventRequest;
      if (id) {
        eventRequest = await EventRequest.findOne({
          where: { id },
          relations: ['eventRequestDetail'],
        });
      }

      const newEventRequest = EventRequest.merge(
        eventRequest ?? EventRequest.create(),
        {
          ...input,
          userId,
        },
      );

      eventRequest = await transaction
        .getRepository(EventRequest)
        .save(newEventRequest);

      return await getOneBase(
        EventRequest,
        eventRequest.id,
        false,
        info,
        '',
        transaction,
      );
    });
  }
}
