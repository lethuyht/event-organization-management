import { BadRequestException, Injectable } from '@nestjs/common';
import { GetEventQuery } from './query/getEvent.query';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Event } from '@/db/entities/Event';
import {
  getPaginationResponse,
  createFilterQueryBuilder,
} from '@/common/base/getPaginationResponse';
import { EventRequestInput, UpsertEventDto } from './dto';
import { GraphQLResolveInfo } from 'graphql';
import { getOneBase } from '@/common/base/getOne';
import { User } from '@/db/entities/User';
import dayjs from 'dayjs';
import { EventServiceItem } from '@/db/entities/EventServiceItem';
import { ValidateCartItem } from '../cart/command/validateCartItem.command';
import { getManager } from 'typeorm';
import {
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  Contract,
} from '@/db/entities/Contract';
import { ServiceItem } from '@/db/entities/ServiceItem';
import { ContractServiceItem } from '@/db/entities/ContractServiceItem';
import { ContractEventServiceItem } from '@/db/entities/ContractEventServiceItem';
import { messageKey } from '@/i18n';
import { ContractEvent } from '@/db/entities/ContractEvent';

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

  async createEventRequest(input: EventRequestInput, user: User) {
    const {
      hireDate,
      hireEndDate,
      eventId,
      isCustomized,
      customizedServiceItems,
      address,
      details,
    } = input;
    if (dayjs().isAfter(dayjs(hireDate).add(1, 'week'))) {
      throw new BadRequestException(
        'Ngày thuê sự kiện phải cách trước 1 tuần để có thể setup!',
      );
    }

    if (dayjs(hireDate).isAfter(hireEndDate)) {
      throw new BadRequestException('Thời gian thuê sự kiện không hợp lệ');
    }

    const event = await Event.findOne({
      where: { id: eventId },
      relations: ['eventServiceItems'],
    });

    if (!event) {
      throw new BadRequestException('Không tìm thấy sự kiện!');
    }

    let serviceItems: EventServiceItem[] = event.eventServiceItems;

    if (isCustomized) {
      serviceItems = customizedServiceItems;
    }

    const contractEventServiceItems: Partial<ContractEventServiceItem>[] = [];
    let totalPrice = 0;

    for (const serviceItem of serviceItems) {
      const item = await ServiceItem.findOne({ id: serviceItem.serviceItemId });

      await ValidateCartItem.availableServiceItemValidate({
        serviceItemId: item.id,
        amount: serviceItem.amount,
        startDate: hireDate,
        endDate: hireEndDate,
      });

      contractEventServiceItems.push({
        serviceItemId: item.id,
        amount: serviceItem.amount,
        price: item.price,
      });
      totalPrice = totalPrice + serviceItem.amount * item.price;
    }

    return getManager().transaction(async (trx) => {
      const contract = Contract.create({
        userId: user.id,
        type: CONTRACT_TYPE.Event,
        status: CONTRACT_STATUS.Draft,
        hireDate,
        hireEndDate,
        address,
        totalPrice: totalPrice * dayjs(hireEndDate).diff(hireDate, 'day'),
        details: details,
        contractEvent: {
          eventId: eventId,
          contractEventServiceItems,
        },
      });

      await Event.update({ id: event.id }, { isUsed: true });

      await trx.getRepository(Contract).save(contract);

      return { message: messageKey.BASE.SUCCESSFULLY, success: true };
    });
  }

  async deleteEvent(id: string) {
    const event = await Event.findOne({ id });
    if (!event) {
      throw new BadRequestException('Không tìm thấy sự kiện!');
    }

    if (event.isUsed) {
      throw new BadRequestException(
        'Không thể thực hiện thao tác xoá cho sự kiện đã được sử dụng!',
      );
    }

    await Event.delete({ id });
    return { message: messageKey.BASE.DELETED_SUCCESSFULLY, success: true };
  }
}
