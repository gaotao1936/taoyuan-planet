import { NextResponse } from 'next/server';
import { seedData } from '@/lib/store';
import { mockProducts, mockPosts, mockOrders, mockCreators } from '@/data/mockData';
import { mockCurrentUser } from '@/data/mockData';

export async function POST() {
  seedData(
    mockProducts,
    mockPosts,
    mockOrders,
    [mockCurrentUser, ...mockCreators.map(c => ({ id: c.id, name: c.name, avatar: c.avatar, phone: '', email: '', isCreator: true }))],
    mockCreators
  );
  return NextResponse.json({ ok: true, message: '数据初始化完成' });
}
