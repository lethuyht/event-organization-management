import { CONTRACT_STATUS } from '@/db/entities/Contract';
import { ContractEventServiceItem } from '@/db/entities/ContractEventServiceItem';
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

    let totalAmount = 0;

    const { sum: sum1 } = await ContractServiceItem.createQueryBuilder()
      .innerJoin('ContractServiceItem.contract', 'Contract')
      .where(
        'ContractServiceItem.hireEndDate >= :hireEndDate AND ContractServiceItem.serviceItemId = :serviceItemId',
        {
          hireEndDate: dayjs(startDate).add(1, 'day').format(),
          serviceItemId,
        },
      )
      .andWhere('Contract.status NOT IN (:...status)', {
        status: [CONTRACT_STATUS.Cancel],
      })
      .select('SUM(ContractServiceItem.amount)')
      .getRawOne();

    const { sum: sum2 } = await ContractEventServiceItem.createQueryBuilder()
      .innerJoin('ContractEventServiceItem.contractEvent', 'contractEvent')
      .innerJoin('contractEvent.contract', 'contract')
      .where(
        '"contract"."hire_end_date" >= :hireEndDate AND ContractEventServiceItem.serviceItemId = :serviceItemId',
        {
          hireEndDate: dayjs(startDate).add(1, 'day').format(),
          serviceItemId,
        },
      )
      .andWhere('"contract"."status" NOT IN (:...status)', {
        status: [CONTRACT_STATUS.Cancel],
      })
      .select('SUM(ContractEventServiceItem.amount)')
      .getRawOne();

    totalAmount = (sum1 || 0) + (sum2 || 0);

    if (
      serviceItem.totalQuantity < amount ||
      serviceItem.totalQuantity < totalAmount + amount
    ) {
      throw new BadRequestException(
        'Dịch vụ hiện không đủ số lượng. Vui lòng nhập số lượng phù hợp hoặc lựa chọn dịch vụ khác!.',
      );
    }
  }
}
