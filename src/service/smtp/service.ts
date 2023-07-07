import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '.';
import { verificationCodeTemplate } from './email-templates/verificationCodeTemplate.template';
import { UserCancelContractSuccessfull } from './email-templates/cancelContractSuccessfully.template';
import { Contract } from '@/db/entities/Contract';
import dayjs from 'dayjs';
import { configuration } from '@/config';

@Injectable()
export class EmailService extends EmailAdapter {
  sendEmailVerificationCode = async ({
    receiverEmail,
    customerName,
    verifyCode,
    verifyLink,
  }: {
    receiverEmail: string;
    customerName: string;
    verifyCode: string;
    verifyLink: string;
  }) => {
    const htmlTemplate = verificationCodeTemplate;
    const content = await this.renderHtml(htmlTemplate, {
      customerName,
      verifyCode,
      verifyLink,
      emailTitle: 'Xác thực tài khoản',
    });

    const subject = 'Xác thực tài khoản người dùng';

    return await this.sendEmail({ receiverEmail, subject, html: content });
  };

  async sendEmailCancelSuccessfull({
    receiverEmail,
    customerName,
    subject,
    contract,
    reason,
  }: {
    receiverEmail: string;
    customerName: string;
    subject: string;
    contract: Contract;
    reason: string;
  }) {
    const html = await this.renderHtml(UserCancelContractSuccessfull, {
      emailTitle: 'Trạng thái hợp đồng',
      contractCode: contract.code,
      customerName,
      phoneNumber: contract.details.customerInfo.phoneNumber,
      address: contract.address,
      hireDate: dayjs(contract.hireDate).format('DD/MM/YYYY HH:mm'),
      hireEndDate: dayjs(contract.hireEndDate).format('DD/MM/YYYY HH:mm'),
      totalPrice: contract.totalPrice,
      cancelDate: dayjs().format('DD/MM/YYYY HH:mm'),
      reason,
      adminMail: configuration.smtpService.from,
    });

    await this.sendEmail({ receiverEmail, subject, html });
  }
}

export const emailService = new EmailService();
