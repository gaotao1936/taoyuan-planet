import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/lib/payments/registry";
import { markOrderPaid } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNo, demo_action, transactionId } = body;

    if (!orderNo) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
    }

    const adapter = getPaymentAdapter("demo");
    const result = await adapter.verifyCallback({ orderNo, demo_action, transactionId });

    if (result.status === "PAID") {
      markOrderPaid(result.orderNo, result.transactionId || `DEMO_${Date.now()}`);
      return NextResponse.json({ success: true, orderNo: result.orderNo });
    }

    return NextResponse.json({ success: false, error: "支付确认失败" }, { status: 400 });
  } catch (error) {
    console.error("[Demo支付] 通知处理失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
