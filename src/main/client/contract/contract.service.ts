import { attachFilters } from '@/common/base/attachQueryFilter';
import {
  createFilterQueryBuilder,
  getPaginationResponse,
} from '@/common/base/getPaginationResponse';
import { QUERY_OPERATOR, ROLE } from '@/common/constant';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { CartItem } from '@/db/entities/CartItem';
import {
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  Contract,
} from '@/db/entities/Contract';
import { ContractServiceItem } from '@/db/entities/ContractServiceItem';
import { User } from '@/db/entities/User';
import { StripeService } from '@/main/shared/stripe/stripe.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';
import { ValidateCartItem } from '../cart/command/validateCartItem.command';
import { ContractQueryCommand } from './command/ContractQuery.query';
import {
  ConfirmContractDeposit,
  RequestContractDto,
  UpdateContractStatusDto,
} from './dto';

@Injectable()
export class ContractService {
  constructor(private stripeService: StripeService) {}
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

    await CartItem.createQueryBuilder()
      .delete()
      .whereInIds(cartItemIds)
      .execute();

    await Contract.save(contract);
    return contract;
  }

  async confirmContractDeposit(input: ConfirmContractDeposit, user: User) {
    const currentUser = await User.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    const { contractId, isApproved } = input;
    const contract = await ContractQueryCommand.getOneById(
      contractId,
      true,
      [],
    );

    if (contract.status !== CONTRACT_STATUS.DepositPaid) {
      throw new BadRequestException(
        'Trạng thái hợp đồng không hợp lệ. Vui lòng thực hiện hoạt động khác',
      );
    }

    if (
      contract.userId !== currentUser.id &&
      currentUser.role.name !== ROLE.Admin
    ) {
      throw new BadRequestException(
        'Bạn không có quyền chỉnh sửa trạng thái của hợp đồng',
      );
    }

    switch (currentUser.role.name) {
      case ROLE.Admin:
        contract.status = CONTRACT_STATUS.InProgress;
        if (!isApproved) {
          contract.status = CONTRACT_STATUS.AdminCancel;
          await this.stripeService.handleRefundContractDeposit(contract);
        }

        break;
      default:
        if (!isApproved) {
          contract.status = CONTRACT_STATUS.Cancel;
        }
    }

    return Contract.save(contract);
  }

  async updateStatusContract(input: UpdateContractStatusDto) {
    const contract = await ContractQueryCommand.getOneById(
      input.contractId,
      true,
      [],
    );

    switch (input.status) {
      case CONTRACT_STATUS.InProgress:
        if (contract.status !== CONTRACT_STATUS.DepositPaid) {
          throw new BadRequestException('Hợp đồng vẫn chưa đặt cọc!');
        }

        break;
      case CONTRACT_STATUS.WaitingPaid:
        if (dayjs(new Date()).isBefore(contract.hireEndDate)) {
          throw new BadRequestException(
            'Hạn thuê của hợp đồng vẫn chưa kết thúc. Vui lòng thử lại sau khi hợp đồng kết thúc',
          );
        }

        break;

      case CONTRACT_STATUS.Completed:
        break;
    }

    contract.status = input.status;
    return Contract.save(contract);
  }
}
