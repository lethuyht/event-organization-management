import { Contract } from '@/db/entities/Contract';
import { ContractServiceItem } from '@/db/entities/ContractServiceItem';
import { ServiceItem } from '@/db/entities/ServiceItem';
import { BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import { getManager } from 'typeorm';

export class ValidateCartItem {
  static async availableServiceItemValidate(
    {
      serviceItemId,
      amount,
      startDate,
      endDate,
    }: {
      serviceItemId: string;
      amount: number;
      startDate: Date;
      endDate: Date;
    },
    transaction = getManager(),
  ) {
    const serviceItem = await transaction
      .getRepository(ServiceItem)
      .findOne({ id: serviceItemId });

    if (!serviceItem) {
      throw new BadRequestException('Không tìm thấy dịch vụ');
    }

    const currentDate = dayjs();

    if (currentDate.add(1, 'day').isAfter(dayjs(startDate), 'day')) {
      throw new BadRequestException(
        'Vui lòng chọn thời gian thuê trước 24h để có thể setup thiết bị',
      );
    }

    const { sum } = await ContractServiceItem.createQueryBuilder()
      .innerJoin('ContractServiceItem.contract', 'contract')
      .where('"contract"."hire_end_date" <= :hireEndDate', {
        hireEndDate: dayjs(endDate).add(1, 'day'),
      })
      .select(['SUM("ContractServiceItem"."amount")'])
      .getRawOne();

    if (
      serviceItem.totalQuantity < amount ||
      serviceItem.totalQuantity - sum < amount
    ) {
      throw new BadRequestException(
        'Dịch vụ hiện không đủ số lượng. Vui lòng nhập số lượng phù hợp hoặc lựa chọn dịch vụ khác!.',
      );
    }
  }
}
