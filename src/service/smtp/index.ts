import nodemailer from 'nodemailer';

import { configuration } from '@/config';

const { host, port, user, password, service, from } = configuration.smtpService;
const { nodeEnv } = configuration.api;
export class EmailService {
  protected transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service,
      host,
      port,
      secure: false,
      auth: {
        user,
        pass: password
      }
    });
  }

  sendEmail = async ({ receiverEmail, subject, html }) => {
    try {
      // if (this.isTestEmail(receiverEmail)) {
      const isProduction = ['release', 'production'].includes(nodeEnv);
      const formatSubject = `${isProduction ? subject : `[${nodeEnv.toUpperCase()}]-${subject}`}`;
      const mailOptions = {
        from,
        to: receiverEmail,
        subject: formatSubject,
        html
      };
      return await this.transporter.sendMail(mailOptions);
      // }
    } catch (err) {
      console.error({ 'lg-sendEmail-error': err }, { 'lg-receiverEmail': receiverEmail });
      throw err;
    }
  };
}
