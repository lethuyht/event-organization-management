import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpsertServiceDto } from './dto';
import { Service } from '@/db/entities/Service';
import { messageKey } from '@/i18n';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
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

    const newService = Service.merge(service ?? Service.create(), {
      ...input,
    });

    if (input.serviceItems) {
      newService.serviceItems = input.serviceItems;
    }

    return Service.save(newService);
  }

  getServices(query: QueryFilterDto) {
    const builder = Service.createQueryBuilder();

    return getPaginationResponse(builder, query);
  }

  async getService(id: string, info?: GraphQLResolveInfo) {
    const relations = info ? Service.getRelations(info) : [];

    const service = await Service.findOne({
      where: {
        id,
      },
      relations,
    });

    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ.');
    }

    return service;
  }
}
