import { DEPOSIT_PERCENT, TIMEZONE, WEBHOOK_TYPE } from '@/common/constant';
import { configuration } from '@/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WEBHOOK_EVENT_TYPE } from './command/constraint';
import { RequestWithRawBody, ServiceItemOfContract } from './interface';
import { DepositContractDto } from './dto';

import _ from 'lodash';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { StripeAdapter } from '@/service/stripe';
import { User } from '@/db/entities/User';
import {
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  Contract,
} from '@/db/entities/Contract';
import { getManager } from 'typeorm';
import Stripe from 'stripe';

import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EmailService } from '@/service/smtp/service';
import { remindApprovedContract } from '@/service/smtp/email-templates/remindApprovedContract.template';
import { ContractServiceItem } from '@/db/entities/ContractServiceItem';
import { ContractEventServiceItem } from '@/db/entities/ContractEventServiceItem';
import { DepositTemplate } from '@/service/smtp/email-templates/depositSuccess.template';
import { BillingRemainSuccessfully } from '@/service/smtp/email-templates/billingRemainSuccessfully.template';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class StripeService {
  private stripeAdapter: StripeAdapter;
  private emailService: EmailService;
  constructor(private scheduleRegister: SchedulerRegistry) {
    this.stripeAdapter = new StripeAdapter();
    this.emailService = new EmailService();
  }

  public async handleConnectWebhooks(
    signature: string,
    request: RequestWithRawBody,
    webhookType: WEBHOOK_TYPE,
  ) {
    if (!signature) {
      return {
        statusCode: 500,
        message: 'Missing stripe-signature header',
      };
    }

    try {
      const webhookSecret = this.getWebhookSecretKey(webhookType);

      const event: any = this.constructEventFromPayload(
        signature,
        request.body,
        webhookSecret,
      );

      console.log('WebhookSecretKeyAndEvent', webhookSecret, event.type);
      switch (event.type) {
        case WEBHOOK_EVENT_TYPE.CHECKOUT_SESSION.COMPLETED:
        case WEBHOOK_EVENT_TYPE.CHECKOUT_SESSION.ASYNC_PAYMENT_SUCCEEDED: {
          await this.handleCheckoutSuccessfully(event);
          break;
        }
      }
      return {
        statusCode: 200,
        message: JSON.stringify({
          received: true,
        }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Webhook Error: ${error.message}`,
      };
    }
  }

  async handleRefundContractDeposit(contract: Contract) {
    if (!contract.paymentIntentId) {
      throw new BadRequestException(
        'Không thể thực hiện hoàn tiền đối với hợp đồng vẫn chưa đặt cọc!',
      );
    }

    const paymentIntent = (await this.stripeAdapter.getPaymentIntent(
      contract.paymentIntentId,
    )) as any;

    await this.stripeAdapter.createRefund({
      chargeId: paymentIntent.latest_charge as string,
    });
  }

  handleCheckoutSuccessfully(event: Stripe.Event) {
    const object = event.data.object as Stripe.Checkout.Session;

    if (object.payment_status === 'paid') {
      const { contractId, status } = object.metadata;

      if (!contractId) {
        throw new BadRequestException(
          'Cannot find contract id for paymentIntent: ' + object.payment_intent,
        );
      }

      return getManager().transaction(async (trx) => {
        const contract = await trx
          .getRepository(Contract)
          .findOne({ id: contractId });

        contract.status = status as CONTRACT_STATUS;
        contract.paymentIntentId = object.payment_intent as string;
        await trx.getRepository(Contract).save(contract);

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
              price: el.price * el.amount,
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
              price: el.price * el.amount,
            };
          });
        }

        const customer = await User.findOne({ where: { id: contract.userId } });

        if (contract.status === CONTRACT_STATUS.DepositPaid) {
          const depositTemplate = await this.emailService.renderHtml(
            DepositTemplate,
            {
              customerName: contract.details.contractName,
              contractCode: contract.code,
              phoneNumber: contract.details.customerInfo.phoneNumber,
              emailTitle: 'Thanh toán thành công',
              hireDate: dayjs(contract.hireDate).format('DD/MM/YYYY HH:mm'),
              hireEndDate: dayjs(contract.hireEndDate).format(
                'DD/MM/YYYY HH:mm',
              ),
              adminMail: configuration.smtpService.from,
              address: contract.address,
              totalPrice: contract.totalPrice * DEPOSIT_PERCENT,
              serviceItems: serviceItems.map((item) => {
                return { ...item, price: item.price * DEPOSIT_PERCENT };
              }),
            },
          );

          await this.emailService.sendEmail({
            receiverEmail: customer.email,
            subject: 'Deposit successfully',
            html: depositTemplate,
          });
        } else {
          const billingRemainTemplate = await this.emailService.renderHtml(
            BillingRemainSuccessfully,
            {
              customerName: contract.details.contractName,
              contractCode: contract.code,
              phoneNumber: contract.details.customerInfo.phoneNumber,
              emailTitle: 'Thanh toán thành công',
              hireDate: dayjs(contract.hireDate).format('DD/MM/YYYY HH:mm'),
              hireEndDate: dayjs(contract.hireEndDate).format(
                'DD/MM/YYYY HH:mm',
              ),
              adminMail: configuration.smtpService.from,
              address: contract.address,
              totalPrice: contract.totalPrice * DEPOSIT_PERCENT,
              serviceItems: serviceItems.map((item) => {
                return { ...item, price: item.price * (1 - DEPOSIT_PERCENT) };
              }),
            },
          );

          await this.emailService.sendEmail({
            receiverEmail: customer.email,
            subject: 'Checkout remain billing successfully',
            html: billingRemainTemplate,
          });
        }

        try {
          const date = dayjs.tz(`${contract.hireDate}`, TIMEZONE).format();

          const remindDate = dayjs
            .tz(`${contract.hireDate}`, TIMEZONE)
            .subtract(3, 'day')
            .format();

          const remindJob = new CronJob(
            new Date(remindDate),
            async () => {
              const cronContract = await Contract.findOne({ id: contract.id });

              if (cronContract.status === CONTRACT_STATUS.DepositPaid) {
                const template = remindApprovedContract;
                const contractHTML = await this.emailService.renderHtml(
                  template,
                  {
                    customerName: cronContract.details.contractName,
                    contractCode: cronContract.code,
                    emailTitle: 'Trạng thái hợp đồng',
                    phoneNumber: cronContract.details.customerInfo.phoneNumber,
                    hireDate: dayjs(cronContract.hireDate).format(
                      'DD/MM/YYYY HH:mm',
                    ),
                    hireEndDate: dayjs(cronContract.hireEndDate).format(
                      'DD/MM/YYYY HH:mm',
                    ),
                    address: cronContract.address,
                    totalPrice: cronContract.totalPrice,
                    serviceItems,
                  },
                );

                await this.emailService.sendEmail({
                  receiverEmail: 'thanhhoang280202@gmail.com',
                  subject: `${cronContract.code} is waiting approved!`,
                  html: contractHTML,
                });
              }
            },
            null,
            true,
          );

          const job = new CronJob(
            new Date(date),
            async () => {
              const cronContract = await Contract.findOne({ id: contract.id });

              if (cronContract.status === CONTRACT_STATUS.InProgress) {
                await this.handleRefundContractDeposit(cronContract);
                contract.status = CONTRACT_STATUS.AdminCancel;
                await Contract.save(cronContract);
              }
            },
            null,
            true,
          );

          this.scheduleRegister.addCronJob(
            `schedule-${date}-${contractId}`,
            job,
          );

          this.scheduleRegister.addCronJob(
            `schedule-remind-${remindDate}-${contractId}`,
            remindJob,
          );
        } catch (error) {
          console.log(
            '🚀 ~ file: stripe.service.ts:316 ~ StripeService ~s error:',
            error,
          );
        }
      });
    }
  }

  getWebhookSecretKey(webhookType: WEBHOOK_TYPE) {
    switch (webhookType) {
      case WEBHOOK_TYPE.POLARIS_ACCOUNT:
        return configuration.stripe.polaris_secret_key;
    }
  }

  constructEventFromPayload(
    signature: string,
    payload: Buffer,
    secretKey: string,
  ) {
    return this.stripeAdapter.constructEvent(signature, payload, secretKey);
  }

  async depositContract(input: DepositContractDto, user: User) {
    const { contractId, successUrl, cancelUrl } = input;
    const contract = await Contract.createQueryBuilder()
      .where('Contract.id = :contractId AND Contract.status = :status', {
        contractId,
        status: CONTRACT_STATUS.Draft,
      })
      .getOne();

    if (!contract) {
      throw new BadRequestException('Hợp đồng đặt cọc không tồn tại');
    }

    const serviceItems: ServiceItemOfContract[] = [];

    switch (contract.type) {
      case CONTRACT_TYPE.Service: {
        const contractServiceItems = await ContractServiceItem.find({
          where: { contractId: contract.id },
          relations: ['serviceItem'],
        });

        for (const { amount, serviceItem, price } of contractServiceItems) {
          serviceItems.push({
            name: serviceItem.name,
            id: serviceItem.id,
            amount,
            price: price,
            images: serviceItem.images ? [serviceItem.images[0]] : [],
          });
        }
      }
      case CONTRACT_TYPE.Event: {
        const contractEventServiceItems = await ContractEventServiceItem.find({
          where: { contractEvent: { contractId: contract.id } },
          relations: ['contractEvent', 'serviceItem'],
        });

        for (const {
          amount,
          serviceItem,
          price,
        } of contractEventServiceItems) {
          serviceItems.push({
            name: serviceItem.name,
            id: serviceItem.id,
            amount,
            price: price,
            images: serviceItem.images ? [serviceItem.images[0]] : [],
          });
        }
      }
      default:
        break;
    }

    const lines = [];

    for (const serviceItem of serviceItems) {
      const product = await this.stripeAdapter.createProduct({
        productName: serviceItem.name,
        productSystemId: serviceItem.id,
        imageUrls: serviceItem.images ? [serviceItem.images[0]] : [],
        description: `Deposit 30% of ${serviceItem.price}VND`,
      });

      lines.push({
        amount: serviceItem.price * DEPOSIT_PERCENT,
        currency: 'vnd',
        product: product.id,
        quantity: serviceItem.amount,
      });
    }

    const lineItems = await this.stripeAdapter.createLineItems(lines);

    const result = await this.stripeAdapter.createCheckoutSession({
      successUrl,
      cancelUrl,
      mode: 'payment',
      lineItems,
      emailCustomer: user.email,
      metadata: {
        contractId,
        status: CONTRACT_STATUS.DepositPaid,
      },
    });

    return {
      checkoutUrl: result.url,
      successUrl: result.success_url,
      cancelUrl: result.cancel_url,
    };
  }

  async checkoutRemainBillingContract(
    contract: Contract,
    rest: Partial<Omit<DepositContractDto, 'contractId'>>,
    user: User,
  ) {
    const serviceItems: ServiceItemOfContract[] = [];

    switch (contract.type) {
      case CONTRACT_TYPE.Service: {
        const contractServiceItems = await ContractServiceItem.find({
          where: { contractId: contract.id },
          relations: ['serviceItem'],
        });

        for (const { amount, serviceItem, price } of contractServiceItems) {
          serviceItems.push({
            name: serviceItem.name,
            id: serviceItem.id,
            amount,
            price: price,
            images: serviceItem.images ? [serviceItem.images[0]] : [],
          });
        }
      }
      case CONTRACT_TYPE.Event: {
        const contractEventServiceItems = await ContractEventServiceItem.find({
          where: { contractEvent: { contractId: contract.id } },
          relations: ['contractEvent', 'serviceItem'],
        });

        for (const {
          amount,
          serviceItem,
          price,
        } of contractEventServiceItems) {
          serviceItems.push({
            name: serviceItem.name,
            id: serviceItem.id,
            amount,
            price: price,
            images: serviceItem.images ? [serviceItem.images[0]] : [],
          });
        }
      }
      default:
        break;
    }

    const lines = [];

    for (const serviceItem of serviceItems) {
      const product = await this.stripeAdapter.createProduct({
        productName: serviceItem.name,
        productSystemId: serviceItem.id,
        imageUrls: serviceItem.images ? [serviceItem.images[0]] : [],
        description: `Deposit 70% of ${serviceItem.price}$`,
      });

      lines.push({
        amount: serviceItem.price * (1 - DEPOSIT_PERCENT),
        currency: 'vnd',
        product: product.id,
        quantity: serviceItem.amount,
      });
    }

    const lineItems = await this.stripeAdapter.createLineItems(lines);

    const result = await this.stripeAdapter.createCheckoutSession({
      successUrl: rest.successUrl,
      cancelUrl: rest.cancelUrl,
      mode: 'payment',
      lineItems,
      emailCustomer: user.email,
      metadata: {
        contractId: contract.id,
        status: CONTRACT_STATUS.Completed,
      },
    });

    return {
      checkoutUrl: result.url,
      successUrl: result.success_url,
      cancelUrl: result.cancel_url,
    };
  }

  async getBalanceOfAdmin() {
    return this.stripeAdapter.getBalances();
  }
}
