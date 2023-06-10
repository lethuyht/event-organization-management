import { getOneBase } from '@/common/base/getOne';
import {
  getPaginationResponse,
  createFilterQueryBuilder,
} from '@/common/base/getPaginationResponse';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Service } from '@/db/entities/Service';
import { messageKey } from '@/i18n';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertServiceDto } from './dto';

@Injectable()
export class ServiceService {
  async upsertService(input: UpsertServiceDto) {
    const { id } = input;
    const service = await Service.createQueryBuilder()
      .where('"Service"."name" ILIKE :name', { name: input.name })
      .getOne();

    if ((!id && service) || (id && service.id !== id)) {
      throw new BadRequestException(messageKey.BASE.SERVICE_NAME_IS_DUPLICATED);
    }

    const newService = Service.merge(service ?? Service.create(), {
      ...input,
    });

    if (input.serviceItems) {
      newService.serviceItems = input.serviceItems;
    }

    return Service.save(newService);
  }

  getServices(query: QueryFilterDto, info: GraphQLResolveInfo) {
    const builder = createFilterQueryBuilder(Service, query, info);

    return getPaginationResponse(builder, query);
  }

  async getService(id: string, info?: GraphQLResolveInfo) {
    return await getOneBase(Service, id, true, info, 'dịch vụ');
  }
}
