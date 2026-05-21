import { PaymentAdapter } from "./types";
import { EpayProvider } from "./providers/epay";
import { DemoProvider } from "./providers/demo";
import { AlipayProvider } from "./providers/alipay";

const adapters: Record<string, PaymentAdapter> = {};

// Always register demo as fallback
const demoProvider = new DemoProvider();
adapters[demoProvider.name] = demoProvider;

// Register Alipay if configured (highest priority)
if (process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY) {
  const alipayProvider = new AlipayProvider();
  adapters[alipayProvider.name] = alipayProvider;
}

// Register EPay if configured
if (process.env.EPAY_API_URL && process.env.EPAY_PID) {
  const epayProvider = new EpayProvider();
  adapters[epayProvider.name] = epayProvider;
}

/** Returns the best available payment adapter (alipay > epay > demo) */
export function getDefaultAdapter(): PaymentAdapter {
  if (adapters["alipay"]) return adapters["alipay"];
  if (adapters["epay"]) return adapters["epay"];
  return adapters["demo"];
}

export function getPaymentAdapter(name: string): PaymentAdapter {
  const adapter = adapters[name];
  if (!adapter) return getDefaultAdapter();
  return adapter;
}

export function getAvailablePaymentMethods() {
  return Object.keys(adapters).map(key => {
    const names: Record<string, string> = {
      alipay: "支付宝",
      epay: "易支付",
      demo: "演示支付",
    };
    return { id: key, name: names[key] || key };
  });
}
