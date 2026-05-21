export interface SmsAdapter {
  name: string;
  sendCode(phone: string, code: string): Promise<{ success: boolean; message: string }>;
}
