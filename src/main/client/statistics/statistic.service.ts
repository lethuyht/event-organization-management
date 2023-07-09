import { Injectable } from '@nestjs/common';
import { StatisticsDto } from './dto';
import {
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  Contract,
} from '@/db/entities/Contract';
import { Brackets } from 'typeorm';
import dayjs from 'dayjs';
import { ContractEventServiceItem } from '@/db/entities/ContractEventServiceItem';
import { ContractServiceItem } from '@/db/entities/ContractServiceItem';
import { StatisticResult } from './interface';
import _ from 'lodash';
import { DEPOSIT_PERCENT } from '@/common/constant';

@Injectable()
export class StatisticService {
  async statisticOfMonth(input: StatisticsDto) {
    const { month, year } = input;

    const result: StatisticResult = {
      revenue: {
        event: 0,
        service: 0,
      },
      details: null,
    };

    const contracts = await Contract.createQueryBuilder()
      .where(
        new Brackets((qb) => {
          qb.where(
            `EXTRACT(YEAR FROM "Contract"."hire_date") = :year AND EXTRACT(MONTH FROM "Contract"."hire_date") = :month`,
          ).orWhere(
            `EXTRACT(YEAR FROM "Contract"."hire_end_date") = :year AND EXTRACT(MONTH FROM "Contract"."hire_end_date") = :month`,
          );
        }),
      )
      .andWhere(`"Contract"."status" NOT IN (:...status)`)
      .setParameters({
        year,
        month,
        status: [CONTRACT_STATUS.Draft],
      })
      .getMany();

    const startOfMonth = dayjs()
      .set('month', month - 1)
      .set('year', year)
      .startOf('month');

    const endOfMonth = dayjs()
      .set('month', month - 1)
      .set('year', year)
      .endOf('month');

    for (const {
      hireDate,
      hireEndDate,
      totalPrice,
      type,
      id,
      paymentIntentId,
      status,
    } of contracts) {
      if (!paymentIntentId) {
        continue;
      }
      let startDate = startOfMonth;
      let endDate = endOfMonth;

      if (dayjs(dayjs(hireDate).startOf('date')).isAfter(startOfMonth)) {
        startDate = dayjs(hireDate);
      }

      if (dayjs(dayjs(hireEndDate).endOf('date')).isBefore(endOfMonth)) {
        endDate = dayjs(hireEndDate);
      }

      let numberOfService = 0;
      let numberOfEvent = 0;

      switch (type) {
        case CONTRACT_TYPE.Event: {
          const totalContractEventServiceItem =
            await ContractEventServiceItem.createQueryBuilder()
              .leftJoin(
                'ContractEventServiceItem.contractEvent',
                'ContractEvent',
              )
              .where(`ContractEvent.contractId = :contractId`, {
                contractId: id,
              })
              .select(`SUM("ContractEventServiceItem"."amount")`, 'total')
              .getRawOne();

          numberOfEvent = +(totalContractEventServiceItem?.total || 0);

          result.revenue.event += totalPrice;
          break;
        }

        case CONTRACT_TYPE.Service: {
          const totalServiceItem =
            await ContractServiceItem.createQueryBuilder()
              .where(`"ContractServiceItem"."contract_id" = :contractId`, {
                contractId: id,
              })
              .select(`SUM("ContractServiceItem"."amount")`, 'total')
              .getRawOne();

          numberOfService = +(totalServiceItem?.total || 0);

          if (status === CONTRACT_STATUS.Cancel) {
            result.revenue.service += totalPrice * DEPOSIT_PERCENT;
          } else {
            result.revenue.service += totalPrice;
          }

          break;
        }
      }

      while (startDate.isBefore(endDate)) {
        if (_.isNil(result.details)) {
          result.details = [
            {
              date: startDate.toDate(),
              eventNumber: numberOfEvent,
              serviceNumber: numberOfService,
            },
          ];
        } else {
          const index = result.details.findIndex((data) =>
            dayjs(data.date).isSame(startDate),
          );

          if (index >= 0) {
            result.details[index].serviceNumber += +numberOfService;

            result.details[index].eventNumber += +numberOfEvent;
          } else {
            result.details.push({
              date: startDate.toDate(),
              eventNumber: numberOfEvent,
              serviceNumber: numberOfService,
            });
          }
        }

        startDate = startDate.add(1, 'day');
      }
    }

    return result;
  }
}
