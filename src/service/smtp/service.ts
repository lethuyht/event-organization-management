import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '.';
import { verificationCodeTemplate } from './email-templates/verificationCodeTemplate.template';

@Injectable()
export class EmailService extends EmailAdapter {
  sendEmailVerificationCode = async ({
    receiverEmail,
    customerName,
    verifyCode,
  }: {
    receiverEmail: string;
    customerName: string;
    verifyCode: string;
  }) => {
    const htmlTemplate = verificationCodeTemplate;
    const content = await this.renderHtml(htmlTemplate, {
      customerName,
      verifyCode,
      emailTitle: 'Verification account',
    });

    const subject = 'Verification Request User';

    return await this.sendEmail({ receiverEmail, subject, html: content });
  };
}

export const emailService = new EmailService();
