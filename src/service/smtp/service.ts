import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '.';
import { verificationCodeTemplate } from './email-templates/verificationCodeTemplate.template';

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
}

export const emailService = new EmailService();
