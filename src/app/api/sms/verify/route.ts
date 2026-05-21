import { NextResponse } from "next/server";
import { verifySmsCode } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ valid: false, error: "缺少参数" }, { status: 400 });
    }

    const valid = verifySmsCode(phone, code);
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false, error: "服务器错误" }, { status: 500 });
  }
}
