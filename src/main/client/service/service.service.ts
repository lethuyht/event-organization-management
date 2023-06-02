import { BadRequestException, Injectable } from '@nestjs/common';
import { UpsertServiceDto } from './dto';
import { Service } from '@/db/entities/Service';
import { messageKey } from '@/i18n';
import { QueryFilter } from '@/common/dtos/queryFilter';
import { getPaginationResponse } from '@/common/base/getPaginationResponse';
import { GraphQLResolveInfo } from 'graphql';

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

    const images = JSON.stringify(input.images)
      .replace('[', '{')
      .replace(']', '}') as unknown as JSON;

    const newService = Service.merge(service ?? Service.create(), {
      ...input,
      images,
    });

    if (input.serviceItems) {
      newService.serviceItems = input.serviceItems;
    }

    return Service.save(newService);
  }

  getServices(query: QueryFilter) {
    const builder = Service.createQueryBuilder();

    return getPaginationResponse(builder, query);
  }

  getService(id: string) {
    return Service.findOne({ id }, { relations: ['serviceItems'] });
  }
}
