import { PaymentAdapter } from "./types";
import { EpayProvider } from "./providers/epay";
import { DemoProvider } from "./providers/demo";

const adapters: Record<string, PaymentAdapter> = {};

// Always register demo as fallback
const demoProvider = new DemoProvider();
adapters[demoProvider.name] = demoProvider;

// Register EPay only if configured
if (process.env.EPAY_API_URL && process.env.EPAY_PID) {
  const epayProvider = new EpayProvider();
  adapters[epayProvider.name] = epayProvider;
}

export function getPaymentAdapter(name: string): PaymentAdapter {
  const adapter = adapters[name];
  if (!adapter) {
    // Fall back to demo if named adapter not found
    return adapters["demo"];
  }
  return adapter;
}

export function getAvailablePaymentMethods() {
  return Object.keys(adapters).map(key => {
    const names: Record<string, string> = { epay: "易支付", demo: "演示支付" };
    return { id: key, name: names[key] || key };
  });
}
