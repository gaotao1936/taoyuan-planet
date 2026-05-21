import { SmsAdapter } from "./types";
import { DemoSmsProvider } from "./providers/demo";
import { AliyunSmsProvider } from "./providers/aliyun";

const adapters: Record<string, SmsAdapter> = {};

// Always register demo
const demoProvider = new DemoSmsProvider();
adapters[demoProvider.name] = demoProvider;

// Register Aliyun if configured
if (process.env.ALIYUN_SMS_ACCESS_KEY_ID && process.env.ALIYUN_SMS_ACCESS_KEY_SECRET) {
  const aliyunProvider = new AliyunSmsProvider();
  adapters[aliyunProvider.name] = aliyunProvider;
}

export function getSmsAdapter(): SmsAdapter {
  if (adapters["aliyun"]) return adapters["aliyun"];
  return adapters["demo"];
}
