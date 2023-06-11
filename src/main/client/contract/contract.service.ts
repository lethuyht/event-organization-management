import {
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  Contract,
} from '@/db/entities/Contract';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';
import { ContractQueryCommand } from './command/ContractQuery.query';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import {
  createFilterQueryBuilder,
  getPaginationResponse,
} from '@/common/base/getPaginationResponse';
import { User } from '@/db/entities/User';
import { attachFilters } from '@/common/base/attachQueryFilter';
import { QUERY_OPERATOR } from '@/common/constant';
import { RequestContractDto } from './dto';
import { CartItem } from '@/db/entities/CartItem';
import _ from 'lodash';
import { ValidateCartItem } from '../cart/command/validateCartItem.command';
import dayjs from 'dayjs';
import { ContractServiceItem } from '@/db/entities/ContractServiceItem';

@Injectable()
export class ContractService {
  async getOne(id: string, info: GraphQLResolveInfo) {
    const relations = info ? Contract.getRelations(info) : [];

    return ContractQueryCommand.getOneById(id, true, relations);
  }

  getContracts(query: QueryFilterDto) {
    const builder = createFilterQueryBuilder(Contract, query);

    return getPaginationResponse(builder, query);
  }

  getMyContracts(query: QueryFilterDto, user: User) {
    let queryParamsClone = <QueryFilterDto>JSON.parse(JSON.stringify(query));
    queryParamsClone = attachFilters(queryParamsClone, [
      { field: 'Contract.user_id', operator: QUERY_OPERATOR.eq, data: user.id },
    ]);

    const builder = createFilterQueryBuilder(Contract, queryParamsClone);

    return getPaginationResponse(builder, queryParamsClone);
  }

  async requestCreateContract(input: RequestContractDto, user: User) {
    const { cartItemIds, details: detailInput } = input;

    if (
      detailInput?.customerInfo?.type === 'company' &&
      !detailInput?.customerInfo?.representative
    ) {
      throw new BadRequestException(
        'Bạn phải nhập người đại diện của công ty nếu muốn tạo hợp đồng đối với doanh nghiệp',
      );
    }

    const cartItems = await CartItem.createQueryBuilder()
      .leftJoinAndSelect('CartItem.serviceItem', 'ServiceItem')
      .whereInIds(cartItemIds)
      .getMany();

    const groupByDateHiredDate = _.groupBy(cartItems, 'hireDate');
    const groupByDateHiredEndDate = _.groupBy(cartItems, 'hireEndDate');

    if (
      dayjs(Object.keys(groupByDateHiredDate)[0]).isBefore(dayjs(new Date()))
    ) {
      throw new BadRequestException(
        'Không thể tạo hợp đồng có ngày thuê trước thời điểm hiện tại',
      );
    }
    if (
      Object.keys(groupByDateHiredDate).length > 1 ||
      Object.keys(groupByDateHiredEndDate).length > 1
    ) {
      throw new BadRequestException(
        'Không thể tạo hợp đồng chung cho các dịch vụ có ngày thuê hoặc ngày trả khác nhau.',
      );
    }

    const groupByServiceItemId = _.groupBy(cartItems, 'serviceItemId');

    let totalPrice = 0;
    let startDate;
    let endDate;

    const contractServiceItems: Partial<ContractServiceItem>[] = [];

    for (const [index, serviceItem] of Object.entries(groupByServiceItemId)) {
      startDate = serviceItem[0].hireDate;
      endDate = serviceItem[0].hireEndDate;
      const priceService = serviceItem[0]?.serviceItem?.price || 0;
      const totalAmount = serviceItem.reduce(
        (total, cur) => total + cur.amount,
        0,
      );

      await ValidateCartItem.availableServiceItemValidate({
        serviceItemId: index,
        amount: totalAmount,
        startDate,
        endDate,
      });

      totalPrice +=
        totalAmount * dayjs(endDate).diff(startDate, 'day') * priceService;
      contractServiceItems.push({ serviceItemId: index, amount: totalAmount });
    }

    const details = detailInput as unknown as JSON;

    //create contract pdf => upload it to s3 and save url into file_url

    const contract = Contract.create({
      userId: user.id,
      type: CONTRACT_TYPE.Service,
      hireDate: startDate,
      hireEndDate: endDate,
      totalPrice,
      address: input.address,
      details,
      status: CONTRACT_STATUS.Draft,
      contractServiceItems,
    });

    //delete all cart item contains cartItemIds, which is passed from params input

    return await Contract.save(contract);
  }
}
