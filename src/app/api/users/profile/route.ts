import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getUserById, updateUser } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (userId) {
    const user = getUserById(parseInt(userId));
    if (!user) return NextResponse.json({ error: '用户未找到' }, { status: 404 });
    return NextResponse.json(user);
  }
  return NextResponse.json(getUsers());
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { userId, ...data } = body;
  if (!userId) return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
  const updated = updateUser(userId, data);
  if (!updated) return NextResponse.json({ error: '用户未找到' }, { status: 404 });
  return NextResponse.json(updated);
}
