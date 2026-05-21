import { PaymentAdapter, PaymentIntent, PaymentStatus, PaymentCallbackData } from "../types";
import crypto from "crypto";

export class WechatProvider implements PaymentAdapter {
  name = "wechat";

  private mchId: string;
  private appId: string;
  private apiV3Key: string;
  private serialNo: string;
  private privateKey: string;
  private siteUrl: string;

  constructor() {
    this.mchId = process.env.WECHAT_MCH_ID || "";
    this.appId = process.env.WECHAT_APP_ID || "";
    this.apiV3Key = process.env.WECHAT_API_V3_KEY || "";
    this.serialNo = process.env.WECHAT_SERIAL_NO || "";
    this.privateKey = this.formatPem(
      process.env.WECHAT_PRIVATE_KEY || "",
      "PRIVATE"
    );

    let url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (url.endsWith("/")) url = url.slice(0, -1);
    this.siteUrl = url;
  }

  private formatPem(key: string, type: "PUBLIC" | "PRIVATE"): string {
    if (!key) return "";
    if (key.includes("-----BEGIN")) return key;
    const raw = key.replace(/[\s\r\n]/g, "");
    const chunks = raw.match(/.{1,64}/g);
    if (!chunks) return key;
    const body = chunks.join("\n");
    if (type === "PRIVATE") {
      return `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----`;
    }
    return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
  }

  private sign(method: string, urlPath: string, body: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString("hex");
    const signStr = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
    const signature = crypto
      .createSign("RSA-SHA256")
      .update(signStr, "utf-8")
      .sign(this.privateKey, "base64");
    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.serialNo}"`;
  }

  private async request(
    method: string,
    path: string,
    body: unknown
  ): Promise<any> {
    const bodyStr = body ? JSON.stringify(body) : "";
    const auth = this.sign(method, path, bodyStr);

    const res = await fetch(`https://api.mch.weixin.qq.com${path}`, {
      method,
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: bodyStr || undefined,
    });

    return res.json();
  }

  async createPayment(
    orderNo: string,
    amount: number,
    description: string,
    options?: { channel?: string }
  ): Promise<PaymentIntent> {
    if (!this.mchId || !this.privateKey) {
      throw new Error(
        "微信支付未配置，请在 Vercel 环境变量中设置 WECHAT_MCH_ID 和 WECHAT_PRIVATE_KEY"
      );
    }

    const amountCents = Math.round(amount * 100);
    const notifyUrl = `${this.siteUrl}/api/payments/wechat/notify`;

    const result = await this.request("POST", "/v3/pay/transactions/native", {
      appid: this.appId,
      mchid: this.mchId,
      description: description.slice(0, 127),
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      amount: {
        total: amountCents,
        currency: "CNY",
      },
    });

    if (result.code_url) {
      return {
        orderId: orderNo,
        amount,
        currency: "CNY",
        qrCode: result.code_url,
      };
    }

    throw new Error(result.message || "微信支付下单失败");
  }

  async verifyCallback(data: any, headers?: any): Promise<PaymentCallbackData> {
    // WeChat v3 callback: verify signature from headers, decrypt resource
    const body = typeof data === "string" ? JSON.parse(data) : data;
    const resource = body?.resource;
    if (!resource) throw new Error("缺少支付通知数据");

    // Decrypt resource using APIv3 key
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(this.apiV3Key),
      Buffer.from(resource.associated_data || "", "utf-8")
    );
    decipher.setAuthTag(Buffer.from(resource.nonce, "utf-8"));

    let decrypted = decipher.update(resource.ciphertext, "base64", "utf-8");
    decrypted += decipher.final("utf-8");
    const trade = JSON.parse(decrypted);

    const isPaid = trade.trade_state === "SUCCESS";

    return {
      orderNo: trade.out_trade_no || "",
      status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      transactionId: trade.transaction_id || "",
      raw: trade,
    };
  }
}
