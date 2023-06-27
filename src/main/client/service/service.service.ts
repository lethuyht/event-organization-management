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
import { PublishServiceDto, UpsertServiceDto } from './dto';

@Injectable()
export class ServiceService {
  async upsertService(input: UpsertServiceDto, info: GraphQLResolveInfo) {
    const { id } = input;

    const service = await Service.createQueryBuilder()
      .where((qb) => {
        if (input.name) {
          qb.andWhere('"Service"."name" ILIKE :name', { name: input.name });
        }
        if (id) {
          qb.andWhere('"Service"."id" = :id', { id });
        }
      })
      .getOne();

    if ((!id && service) || (id && service && service.id !== id)) {
      throw new BadRequestException(messageKey.BASE.SERVICE_NAME_IS_DUPLICATED);
    }

    const newService = Service.merge(service ?? Service.create(), {
      ...input,
    });

    if (input.serviceItems) {
      newService.serviceItems = input.serviceItems;
    }

    await Service.save(newService);
    return Service.findOne({
      where: { id: newService.id },
      relations: ['serviceItems'],
    });
  }

  getServices(query: QueryFilterDto, info: GraphQLResolveInfo) {
    const builder = createFilterQueryBuilder(Service, query, info);

    builder.addSelect(
      `
      CASE
        WHEN (SELECT COUNT(*) FROM "service_item" WHERE "service_item"."service_id" = "Service"."id" AND "service_item"."is_used" = true) > 0
      THEN TRUE
      ELSE FALSE
      END        
    `,
      'Service_is_used',
    );

    return getPaginationResponse(builder, query);
  }

  async getService(id: string, info?: GraphQLResolveInfo) {
    return await getOneBase(Service, id, true, info, 'dịch vụ');
  }

  async publishService(input: PublishServiceDto) {
    const { id, isPublished, serviceItems } = input;
    const service = await Service.findOne(
      { id },
      { relations: ['serviceItems'] },
    );

    if (!service) {
      throw new BadRequestException('Không tìm thấy loại dịch vụ');
    }

    if (
      isPublished &&
      !serviceItems.some((item) => item.isPublished === true)
    ) {
      throw new BadRequestException('Phải có ít nhất một dịch vụ được publish');
    }

    const newService = Service.merge(service, input);
    newService.serviceItems = serviceItems;
    return Service.save(newService);
  }
}
