import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/lib/payments/registry";
import { markOrderPaid } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.text();

  try {
    console.log("[微信通知]", body);

    const adapter = getPaymentAdapter("wechat");
    const result = await adapter.verifyCallback(body);

    if (result.status === "PAID") {
      markOrderPaid(result.orderNo, result.transactionId || "");
      console.log("[微信] 订单已支付:", result.orderNo);
    }

    return new NextResponse(
      JSON.stringify({ code: "SUCCESS", message: "成功" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[微信] 通知处理失败:", error);
    return new NextResponse(
      JSON.stringify({ code: "FAIL", message: "失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
