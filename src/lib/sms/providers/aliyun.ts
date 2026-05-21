import { SmsAdapter } from "../types";
import crypto from "crypto";

export class AliyunSmsProvider implements SmsAdapter {
  name = "aliyun";

  private accessKeyId: string;
  private accessKeySecret: string;
  private signName: string;
  private templateCode: string;

  constructor() {
    this.accessKeyId = process.env.ALIYUN_SMS_ACCESS_KEY_ID || "";
    this.accessKeySecret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET || "";
    this.signName = process.env.ALIYUN_SMS_SIGN_NAME || "桃园文创";
    this.templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE || "";
  }

  async sendCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    if (!this.accessKeyId || !this.accessKeySecret) {
      return { success: false, message: "阿里云短信未配置" };
    }
    if (!this.templateCode) {
      return { success: false, message: "短信模板未配置" };
    }

    try {
      const params: Record<string, string> = {
        AccessKeyId: this.accessKeyId,
        Action: "SendSms",
        Format: "JSON",
        PhoneNumbers: phone,
        SignName: this.signName,
        TemplateCode: this.templateCode,
        TemplateParam: JSON.stringify({ code }),
        SignatureMethod: "HMAC-SHA1",
        SignatureVersion: "1.0",
        SignatureNonce: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
        Version: "2017-05-25",
      };

      const signature = this.sign(params);
      params.Signature = signature;

      const queryString = Object.keys(params)
        .sort()
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join("&");

      const response = await fetch(`https://dysmsapi.aliyuncs.com/?${queryString}`, {
        method: "GET",
      });

      const result = await response.json();
      if (result.Code === "OK") {
        return { success: true, message: "验证码已发送" };
      }
      return { success: false, message: result.Message || "发送失败" };
    } catch (err: any) {
      return { success: false, message: err.message || "发送失败" };
    }
  }

  private sign(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");
    const stringToSign = `GET&${encodeURIComponent("/")}&${encodeURIComponent(queryString)}`;
    return crypto
      .createHmac("sha1", `${this.accessKeySecret}&`)
      .update(stringToSign)
      .digest("base64");
  }
}
