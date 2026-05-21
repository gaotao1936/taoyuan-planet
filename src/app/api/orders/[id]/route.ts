import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, markOrderSettled } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) return NextResponse.json({ error: '订单未找到' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, action } = body;

  if (action === 'settle') {
    const settled = markOrderSettled(id, body.note);
    if (!settled) return NextResponse.json({ error: '订单未找到' }, { status: 404 });
    return NextResponse.json(settled);
  }

  if (status) {
    const updated = updateOrderStatus(id, status);
    if (!updated) return NextResponse.json({ error: '订单未找到' }, { status: 404 });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: '缺少 status 或 action 参数' }, { status: 400 });
}
