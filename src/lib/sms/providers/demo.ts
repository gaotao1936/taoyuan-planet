import { SmsAdapter } from "../types";

export class DemoSmsProvider implements SmsAdapter {
  name = "demo";

  async sendCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    console.log(`[Demo SMS] 发送验证码到 ${phone}: ${code}`);
    return { success: true, message: "演示模式：验证码已发送" };
  }
}
