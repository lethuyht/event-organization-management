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
import { ServiceItem } from '@/db/entities/ServiceItem';
import { CronJob } from 'cron';
import { emailService } from '@/service/smtp/service';
import { configuration } from '@/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { waitingPaidTemplate } from '@/service/smtp/email-templates/waittingPaidTemplate.template';
import { ServiceItemOfContract } from '@/main/shared/stripe/interface';
import { ContractEventServiceItem } from '@/db/entities/ContractEventServiceItem';
import { ContractCompleted } from '@/service/smtp/email-templates/contractCompleted.template';
import { getManager } from 'typeorm';

@Injectable()
export class ContractService {
  constructor(
    private stripeService: StripeService,
    private scheduleRegister: SchedulerRegistry,
  ) {}
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
          price: item.serviceItem.price,
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

    const serviceItemIds = contractServiceItems.map((el) => el.serviceItemId);

    await ServiceItem.createQueryBuilder()
      .update({ isUsed: true })
      .whereInIds(serviceItemIds)
      .execute();

    await CartItem.createQueryBuilder()
      .delete()
      .whereInIds(cartItemIds)
      .execute();

    await Contract.save(contract);

    //handle cron
    const cancelDate = dayjs().add(3, 'day').format();
    const cancelJob = new CronJob(
      new Date(cancelDate),
      async () => {
        const cronContract = await Contract.findOne({ id: contract.id });
        if (cronContract.status === CONTRACT_STATUS.Draft) {
          //user
          cronContract.status = CONTRACT_STATUS.Cancel;
          await emailService.sendEmailCancelSuccessfull({
            receiverEmail: user.email,
            subject: 'Cập nhật trạng thái hợp đồng',
            reason: 'Hợp đồng đã bị huỷ do quá hạn đặc cọc',
            contract,
            customerName: `${user.firstName} ${user.lastName}`,
          });

          await emailService.sendEmailCancelSuccessfull({
            receiverEmail: configuration.smtpService.from,
            subject: 'Cập nhật trạng thái hợp đồng',
            reason: 'Hợp đồng đã bị huỷ do quá hạn đặc cọc',
            contract,
            customerName: `${user.firstName} ${user.lastName}`,
          });

          await Contract.save(cronContract);
        }
      },
      null,
      true,
    );

    this.scheduleRegister.addCronJob(
      `cancel-${contract.id}-${cancelDate}`,
      cancelJob,
    );

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

    const customer = await User.findOne({ where: { id: contract.userId } });
    return getManager().transaction(async (trx) => {
      let status;
      switch (currentUser.role.name) {
        case ROLE.Admin:
          if (!isApproved) {
            status = CONTRACT_STATUS.AdminCancel;
            await trx
              .getRepository(Contract)
              .save(Contract.merge(contract, { status }));
            await this.stripeService.handleRefundContractDeposit(contract);

            //user
            await emailService.sendEmailCancelSuccessfull({
              reason:
                'Hợp đồng của bạn đã bị huỷ vì một vài lí do. Chúng tôi rất lấy làm tiếc và sẽ hoàn lại tiền cho bạn, vui lòng kiểm tra lại số tiền trên tài khoản stripe',
              receiverEmail: customer.email,
              subject: 'Cập nhật trạng thái hợp đồng',
              contract: contract,
              customerName: contract.details.customerInfo.name,
            });
            //admin
            await emailService.sendEmailCancelSuccessfull({
              reason: 'Admin cập nhật trạng thái',
              receiverEmail: configuration.smtpService.from,
              subject: 'Cập nhật trạng thái hợp đồng',
              contract: contract,
              customerName: contract.details.customerInfo.name,
            });
          } else {
            status = CONTRACT_STATUS.InProgress;
            await trx
              .getRepository(Contract)
              .save(Contract.merge(contract, { status }));
          }

          break;
        default:
          if (!isApproved) {
            if (dayjs().isAfter(contract.hireDate)) {
              throw new BadRequestException(
                'Bạn không thể huỷ hợp đồng đã có hiệu lực',
              );
            }

            await emailService.sendEmailCancelSuccessfull({
              reason:
                'Vì thao tác của người dùng nên sẽ hợp đồng sẽ không hoàn lại tiền đã đặt cọc',
              receiverEmail: customer.email,
              subject: 'Cập nhật trạng thái hợp đồng',
              contract: contract,
              customerName: contract.details.customerInfo.name,
            });

            await emailService.sendEmailCancelSuccessfull({
              reason: 'Người dùng đã huỷ hợp đồng thành công',
              receiverEmail: configuration.smtpService.from,
              subject: 'Cập nhật trạng thái hợp đồng',
              contract: contract,
              customerName: contract.details.customerInfo.name,
            });

            status = CONTRACT_STATUS.Cancel;
            await trx
              .getRepository(Contract)
              .save(Contract.merge(contract, { status }));
          }
      }

      return contract;
    });
  }

  async updateStatusContract(input: UpdateContractStatusDto) {
    const contract = await ContractQueryCommand.getOneById(
      input.contractId,
      true,
      [],
    );

    if (
      ![CONTRACT_STATUS.WaitingPaid, CONTRACT_STATUS.Completed].includes(
        input.status,
      )
    ) {
      throw new BadRequestException('Trạng thái hợp đồng không hợp lệ');
    }

    const customer = await User.findOne({ where: { id: contract.userId } });

    switch (input.status) {
      case CONTRACT_STATUS.WaitingPaid:
        if (dayjs(new Date()).isBefore(contract.hireEndDate)) {
          throw new BadRequestException(
            'Hạn thuê của hợp đồng vẫn chưa kết thúc. Vui lòng thử lại sau khi hợp đồng kết thúc',
          );
        }

        let serviceItems: ServiceItemOfContract[];
        if (contract.type === CONTRACT_TYPE.Service) {
          const contractServiceItem = await ContractServiceItem.find({
            where: { contractId: contract.id },
            relations: ['serviceItem'],
          });

          serviceItems = contractServiceItem.map((el) => {
            return {
              amount: el.amount,
              name: el.serviceItem.name,
              price: el.price * el.amount * 0.7,
            };
          });
        } else {
          const contractEventServiceItem = await ContractEventServiceItem.find({
            where: { contractEvent: { contractId: contract.id } },
            relations: ['contractEvent', 'serviceItem'],
          });

          serviceItems = contractEventServiceItem.map((el) => {
            return {
              amount: el.amount,
              name: el.serviceItem.name,
              price: el.price * el.amount * 0.7,
            };
          });
        }

        const html = await emailService.renderHtml(waitingPaidTemplate, {
          emailTitle: 'Thanh toán hợp đồng',
          contractCode: contract.code,
          customerName: contract.details.customerInfo.name,
          serviceItems,
          address: contract.address,
          hireDate: dayjs(contract.hireDate).format('DD/MM/YYYY HH:mm'),
          hireEndDate: dayjs(contract.hireEndDate).format('DD/MM/YYYY HH:mm'),
          totalPrice: contract.totalPrice * 0.7,
          adminMail: configuration.smtpService.from,
        });

        await emailService.sendEmail({
          receiverEmail: customer.email,
          subject: 'Thanh toán phần còn lại',
          html,
        });
        break;

      case CONTRACT_STATUS.Completed:
        const htmltemplate = await emailService.renderHtml(ContractCompleted, {
          contractCode: contract.code,
          emailTitle: 'Hợp đồng đã hoàn thành',
        });

        await emailService.sendEmail({
          receiverEmail: customer.email,
          subject: 'Hoàn tất hợp đồng',
          html: htmltemplate,
        });
        break;
    }

    contract.status = input.status;
    return Contract.save(contract);
  }

  async checkoutRemainBillingContract(input: DepositContractDto, user: User) {
    const { contractId, ...rest } = input;
    const contract = await Contract.findOne({
      where: { id: contractId },
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
