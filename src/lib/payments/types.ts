export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export interface PaymentIntent {
  orderId: string;
  amount: number;
  currency: string;
  payUrl?: string;
  qrCode?: string;
  transactionId?: string;
}

export interface PaymentCallbackData {
  orderNo: string;
  status: PaymentStatus;
  transactionId?: string;
  raw: any;
}

export interface PaymentAdapter {
  name: string;
  createPayment(
    orderNo: string,
    amount: number,
    description: string,
    options?: { channel?: string }
  ): Promise<PaymentIntent>;
  verifyCallback(data: any, headers?: any): Promise<PaymentCallbackData>;
  queryStatus?(orderNo: string): Promise<PaymentStatus>;
}
