import { PaymentAdapter, PaymentIntent, PaymentStatus, PaymentCallbackData } from "../types";
import crypto from "crypto";

export class AlipayProvider implements PaymentAdapter {
  name = "alipay";

  private appId: string;
  private privateKey: string;
  private alipayPublicKey: string;
  private gateway: string;
  private siteUrl: string;

  constructor() {
    this.appId = process.env.ALIPAY_APP_ID || "";
    this.privateKey = this.formatPem(
      process.env.ALIPAY_PRIVATE_KEY || "",
      "PRIVATE"
    );
    this.alipayPublicKey = this.formatPem(
      process.env.ALIPAY_PUBLIC_KEY || "",
      "PUBLIC"
    );
    this.gateway =
      process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do";

    let url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (url.endsWith("/")) url = url.slice(0, -1);
    this.siteUrl = url;
  }

  private formatPem(key: string, type: "PUBLIC" | "PRIVATE"): string {
    if (!key) return "";
    // Already in PEM format
    if (key.includes("-----BEGIN")) return key;
    // Raw base64, add PEM headers
    const raw = key.replace(/[\s\r\n]/g, "");
    const chunks = raw.match(/.{1,64}/g);
    if (!chunks) return key;
    const body = chunks.join("\n");
    if (type === "PRIVATE") {
      return `-----BEGIN RSA PRIVATE KEY-----\n${body}\n-----END RSA PRIVATE KEY-----`;
    }
    return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
  }

  private signRSA2(data: string): string {
    if (!this.privateKey) throw new Error("支付宝商户私钥未配置");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(data, "utf-8");
    return sign.sign(this.privateKey, "base64");
  }

  private buildQuery(params: Record<string, string>): string {
    return Object.keys(params)
      .filter(k => params[k] !== "" && params[k] !== undefined && k !== "sign")
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join("&");
  }

  async createPayment(
    orderNo: string,
    amount: number,
    description: string,
    options?: { channel?: string }
  ): Promise<PaymentIntent> {
    if (!this.appId || !this.privateKey) {
      throw new Error(
        "支付宝未配置，请在 Vercel 环境变量中设置 ALIPAY_APP_ID 和 ALIPAY_PRIVATE_KEY"
      );
    }

    const notifyUrl = `${this.siteUrl}/api/payments/alipay/notify`;
    const returnUrl = `${this.siteUrl}/order-list?orderNo=${orderNo}`;

    // Biz content for page pay
    const bizContent = JSON.stringify({
      out_trade_no: orderNo,
      total_amount: amount.toFixed(2),
      subject: description,
      product_code: "FAST_INSTANT_TRADE_PAY",
    });

    const params: Record<string, string> = {
      app_id: this.appId,
      method: "alipay.trade.page.pay",
      format: "JSON",
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "+08:00"),
      version: "1.0",
      notify_url: notifyUrl,
      return_url: returnUrl,
      biz_content: bizContent,
    };

    const queryString = this.buildQuery(params);
    const sign = this.signRSA2(queryString);
    const payUrl = `${this.gateway}?${queryString}&sign=${encodeURIComponent(sign)}`;

    return {
      orderId: orderNo,
      amount,
      currency: "CNY",
      payUrl,
    };
  }

  async verifyCallback(data: any, _headers?: any): Promise<PaymentCallbackData> {
    const { sign, sign_type, ...rest } = data;

    if (!sign) throw new Error("缺少签名");

    // Rebuild signed string and verify
    const queryString = this.buildQuery(rest as Record<string, string>);
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(queryString, "utf-8");

    if (!this.alipayPublicKey) throw new Error("支付宝公钥未配置");

    const isValid = verify.verify(this.alipayPublicKey, sign, "base64");
    if (!isValid) throw new Error("支付宝签名验证失败");

    // trade_status: TRADE_SUCCESS / TRADE_FINISHED / WAIT_BUYER_PAY / TRADE_CLOSED
    const tradeStatus = rest.trade_status || "";
    const isPaid = tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED";

    return {
      orderNo: rest.out_trade_no || "",
      status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      transactionId: rest.trade_no || "",
      raw: data,
    };
  }
}
