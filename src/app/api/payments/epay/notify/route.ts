import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/lib/payments/registry";
import { markOrderPaid } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return processNotification(Object.fromEntries(searchParams.entries()));
}

export async function POST(req: Request) {
  const formData = await req.formData();
  return processNotification(Object.fromEntries(formData.entries()));
}

async function processNotification(data: any) {
  console.log("[EPay通知]", data);

  try {
    const adapter = getPaymentAdapter("epay");
    const result = await adapter.verifyCallback(data);

    if (result.status === "PAID") {
      const updated = markOrderPaid(result.orderNo, result.transactionId || "");
      if (!updated) {
        console.error("[EPay] 订单未找到:", result.orderNo);
        return new NextResponse("order not found", { status: 404 });
      }
      console.log("[EPay] 订单已支付:", result.orderNo);
    }

    return new NextResponse("success");
  } catch (error) {
    console.error("[EPay] 验签失败:", error);
    return new NextResponse("fail", { status: 400 });
  }
}
