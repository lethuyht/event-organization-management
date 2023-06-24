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
import { DepositContractDto } from '@/main/shared/stripe/dto';
import puppeteer from 'puppeteer';
import { ContractTemplate } from '@/main/shared/contract/contract.template';
import { messageKey } from '@/i18n';

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

    const groupByServiceItemId = _.groupBy(cartItems, 'serviceItemId');

    let totalPrice = 0;

    const startContractDate = dayjs(
      Math.min(...cartItems.map((el) => dayjs(el.hireDate).unix())) * 1000,
    ).format();

    const endContractDate = dayjs(
      Math.max(...cartItems.map((el) => dayjs(el.hireEndDate).unix())) * 1000,
    ).format();

    const contractServiceItems: Partial<ContractServiceItem>[] = [];

    for (const [index, serviceItem] of Object.entries(groupByServiceItemId)) {
      for (const item of serviceItem) {
        totalPrice +=
          item.amount *
          (item.serviceItem?.price || 0) *
          dayjs(item.hireEndDate).diff(item.hireDate, 'day');

        await ValidateCartItem.availableServiceItemValidate({
          serviceItemId: index,
          amount: item.amount,
          startDate: item.hireDate,
          endDate: item.hireEndDate,
        });

        contractServiceItems.push({
          serviceItemId: index,
          amount: item.amount,
          hireDate: item.hireDate,
          hireEndDate: item.hireEndDate,
        });
      }
    }

    const details = detailInput;
    const contract = Contract.create({
      userId: user.id,
      type: CONTRACT_TYPE.Service,
      hireDate: startContractDate,
      hireEndDate: endContractDate,
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
    return { message: messageKey.BASE.SUCCESSFULLY, success: true };
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

  async checkoutRemainBillingContract(input: DepositContractDto, user: User) {
    const { contractId, ...rest } = input;
    const contract = await Contract.findOne({
      where: { id: contractId },
      relations: ['contractServiceItems'],
    });

    if (!contract) {
      throw new BadRequestException('Hợp đồng không tồn tại');
    }

    if (contract.status !== CONTRACT_STATUS.WaitingPaid) {
      throw new BadRequestException(
        'Trạng thái của hợp đồng không hợp lệ. Vui lòng thực hiện hành động này sau khi hợp đồng có hiệu lực',
      );
    }

    if (!contract.paymentIntentId) {
      throw new BadRequestException('Hợp đồng chưa được đặt cọc');
    }

    return await this.stripeService.checkoutRemainBillingContract(
      contract,
      rest,
      user,
    );
  }

  async generatePDF() {
    const browser = await puppeteer.launch({
      // headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(ContractTemplate, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');
    const buffer = await page.pdf({
      path: 'contract.pdf',
      format: 'A4',
    });
    await browser.close();

    console.log(buffer);
  }
}
