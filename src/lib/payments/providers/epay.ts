import { PaymentAdapter, PaymentIntent, PaymentStatus, PaymentCallbackData } from "../types";
import crypto from "crypto";

export class EpayProvider implements PaymentAdapter {
  name = "epay";

  private apiUrl: string;
  private pid: string;
  private key: string;
  private signType: "MD5" | "RSA";
  private publicKey: string;
  private privateKey: string;
  private siteUrl: string;

  constructor() {
    this.apiUrl = (process.env.EPAY_API_URL || "").replace(/\/$/, "");
    this.pid = process.env.EPAY_PID || "";
    this.key = process.env.EPAY_KEY || "";
    this.signType = (process.env.EPAY_SIGN_TYPE as "MD5" | "RSA") || "MD5";
    this.publicKey = process.env.EPAY_PUBLIC_KEY || "";
    this.privateKey = process.env.EPAY_PRIVATE_KEY || "";

    let url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (url.endsWith("/")) url = url.slice(0, -1);
    this.siteUrl = url;
  }

  private formatKey(key: string, type: "PUBLIC" | "PRIVATE"): string {
    if (!key) return "";
    let raw = key
      .replace(/-----BEGIN (RSA )?(PUBLIC|PRIVATE) KEY-----/g, "")
      .replace(/-----END (RSA )?(PUBLIC|PRIVATE) KEY-----/g, "")
      .replace(/[\s\r\n]/g, "");
    const chunks = raw.match(/.{1,64}/g);
    if (!chunks) return key;
    const body = chunks.join("\n");
    if (type === "PRIVATE") {
      return `-----BEGIN RSA PRIVATE KEY-----\n${body}\n-----END RSA PRIVATE KEY-----`;
    }
    return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
  }

  private getParamString(params: Record<string, string>): string {
    return Object.keys(params)
      .sort()
      .filter(k => params[k] !== "" && k !== "sign" && k !== "sign_type")
      .map(k => `${k}=${params[k]}`)
      .join("&");
  }

  private signMD5(params: Record<string, string>): string {
    return crypto
      .createHash("md5")
      .update(this.getParamString(params) + this.key)
      .digest("hex");
  }

  private signRSA(params: Record<string, string>): string {
    const paramStr = this.getParamString(params);
    if (!this.privateKey) throw new Error("RSA 私钥未配置");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(paramStr);
    return sign.sign(this.formatKey(this.privateKey, "PRIVATE"), "base64");
  }

  private sign(params: Record<string, string>): string {
    return this.signType === "RSA" ? this.signRSA(params) : this.signMD5(params);
  }

  async createPayment(
    orderNo: string,
    amount: number,
    description: string,
    options?: { channel?: string }
  ): Promise<PaymentIntent> {
    if (!this.apiUrl || !this.pid) {
      throw new Error("易支付未配置，请在 .env.local 中设置 EPAY_API_URL 和 EPAY_PID");
    }

    const channel = options?.channel || "alipay";
    const notifyUrl = `${this.siteUrl}/api/payments/epay/notify`;
    const returnUrl = `${this.siteUrl}/order-list?orderNo=${orderNo}`;

    const params: Record<string, string> = {
      pid: this.pid,
      type: channel,
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: description,
      money: amount.toFixed(2),
      sitename: "桃园文创",
      sign_type: this.signType,
    };

    const sign = this.sign(params);
    const queryString = new URLSearchParams({ ...params, sign }).toString();
    const payUrl = `${this.apiUrl}/submit.php?${queryString}`;

    return {
      orderId: orderNo,
      amount,
      currency: "CNY",
      payUrl,
    };
  }

  async verifyCallback(data: any, _headers?: any): Promise<PaymentCallbackData> {
    const { sign, sign_type, ...params } = data;
    if (!sign) throw new Error("缺少签名");

    const incomingSignType = (sign_type || this.signType).toUpperCase();

    if (incomingSignType === "RSA") {
      if (!this.publicKey) throw new Error("RSA 公钥未配置");
      const verify = crypto.createVerify("RSA-SHA256");
      verify.update(this.getParamString(params as Record<string, string>));
      if (!verify.verify(this.formatKey(this.publicKey, "PUBLIC"), sign, "base64")) {
        throw new Error("RSA 签名验证失败");
      }
    } else {
      if (!this.key) throw new Error("MD5 密钥未配置");
      const calculated = this.signMD5(params as Record<string, string>);
      if (calculated !== sign) throw new Error("MD5 签名验证失败");
    }

    const status =
      params.trade_status === "TRADE_SUCCESS" ? PaymentStatus.PAID : PaymentStatus.FAILED;

    return {
      orderNo: params.out_trade_no,
      status,
      transactionId: params.trade_no,
      raw: data,
    };
  }
}
