import { PaymentAdapter } from "./types";
import { EpayProvider } from "./providers/epay";

const adapters: Record<string, PaymentAdapter> = {};

const epayProvider = new EpayProvider();
adapters[epayProvider.name] = epayProvider;

export function getPaymentAdapter(name: string): PaymentAdapter {
  const adapter = adapters[name];
  if (!adapter) throw new Error(`支付渠道 '${name}' 未找到`);
  return adapter;
}

export function getAvailablePaymentMethods() {
  return Object.keys(adapters).map(key => ({ id: key, name: key === "epay" ? "易支付" : key }));
}
