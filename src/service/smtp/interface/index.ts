export interface MailBody<T> {
  receiverEmail: string;
  customerName: string;
  subject: string;
  body: T;
}

export interface SendMailConfirmQualifiedTutor {
  approved: boolean;
  message?: string;
}
