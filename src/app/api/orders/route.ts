import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  let orders = getOrders();

  if (status) {
    const statusMap: Record<string, string> = {
      '0': '待付款', '1': '待发货', '2': '待收货', '3': '已完成', '4': '已取消'
    };
    orders = orders.filter(o => o.status === (statusMap[status] || status));
  }

  const total = orders.length;
  const start = (page - 1) * pageSize;
  const items = orders.slice(start, start + pageSize);

  return NextResponse.json({ items, total, page, pageSize, hasMore: start + pageSize < total });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const order = {
    ...body,
    id: 'order' + Date.now(),
    orderNo: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 17),
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: '待付款',
  };
  createOrder(order);
  return NextResponse.json(order, { status: 201 });
}
