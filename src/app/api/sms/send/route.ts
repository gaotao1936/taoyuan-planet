import { NextResponse } from "next/server";
import { getSmsAdapter } from "@/lib/sms/registry";
import { saveSmsCode } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    const adapter = getSmsAdapter();
    const isDemo = adapter.name === "demo";
    const code = isDemo ? "1234" : String(Math.floor(100000 + Math.random() * 900000));

    const result = await adapter.sendCode(phone, code);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Persist code for verification
    saveSmsCode(phone, code);

    return NextResponse.json({
      success: true,
      message: result.message,
      ...(isDemo ? { demoCode: code } : {}),
    });
  } catch {
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
