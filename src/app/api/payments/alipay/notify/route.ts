import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/lib/payments/registry";
import { markOrderPaid } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((v, k) => { data[k] = v.toString(); });

    console.log("[支付宝通知]", data);

    const adapter = getPaymentAdapter("alipay");
    const result = await adapter.verifyCallback(data);

    if (result.status === "PAID") {
      markOrderPaid(result.orderNo, result.transactionId || "");
      console.log("[支付宝] 订单已支付:", result.orderNo);
      return new NextResponse("success");
    }

    return new NextResponse("fail", { status: 400 });
  } catch (error) {
    console.error("[支付宝] 验签失败:", error);
    return new NextResponse("fail", { status: 400 });
  }
}
