export interface EmailRecipient {
  email: string;
  name?: string | null;
}

export interface EmailSendOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
}
