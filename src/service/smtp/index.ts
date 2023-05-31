import SendmailTransport from 'nodemailer/lib/sendmail-transport';
import * as nodemailer from 'nodemailer';
import * as handlerbars from 'handlebars';
import { configuration } from '@/config';
import { APP_ENV } from '@/common/constant';

const { host, port, user, password, service, from } = configuration.smtpService;
const { nodeEnv } = configuration.api;

export class EmailAdapter {
  protected transporter: SendmailTransport;
  renderHtml = async (htmlBody: string, data: any): Promise<string> => {
    const emailContent = `${htmlBody}`;
    return handlerbars.compile(emailContent)(data);
  };

  initTransport = async () => {
    const configMailTesting = !service
      ? { host, port: +port, secure: false }
      : { service };

    return nodemailer.createTransport({
      ...configMailTesting,
      auth: {
        user,
        pass: password,
      },
    });
  };

  sendEmail = async ({ receiverEmail, subject, html }) => {
    try {
      const isProduction = [APP_ENV.RELEASE].includes(nodeEnv);
      const formatSubject = `${
        isProduction ? subject : `[${nodeEnv.toUpperCase()}]-${subject}`
      }`;
      const mailOptions = {
        from,
        to: receiverEmail,
        subject: formatSubject,
        html,
      };

      const transporter = await this.initTransport();
      const result = await transporter.sendMail(mailOptions);
      return result;
    } catch (err) {
      console.error(
        { 'lg-sendEmail-error': err },
        { 'lg-receiverEmail': receiverEmail },
      );
      throw err;
    }
  };
}
