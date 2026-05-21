import { PaymentAdapter, PaymentIntent, PaymentStatus, PaymentCallbackData } from "../types";

export class DemoProvider implements PaymentAdapter {
  name = "demo";

  private siteUrl: string;

  constructor() {
    let url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (url.endsWith("/")) url = url.slice(0, -1);
    this.siteUrl = url;
  }

  async createPayment(
    orderNo: string,
    amount: number,
    description: string,
    _options?: { channel?: string }
  ): Promise<PaymentIntent> {
    const params = new URLSearchParams({ orderNo, amount: amount.toFixed(2), desc: description });
    return {
      orderId: orderNo,
      amount,
      currency: "CNY",
      payUrl: `${this.siteUrl}/payment-demo?${params.toString()}`,
    };
  }

  async verifyCallback(data: any, _headers?: any): Promise<PaymentCallbackData> {
    const isPaid = data?.demo_action === "paid";
    return {
      orderNo: data?.orderNo || "",
      status: isPaid ? PaymentStatus.PAID : PaymentStatus.FAILED,
      transactionId: data?.transactionId || `DEMO_${Date.now()}`,
      raw: data,
    };
  }
}
