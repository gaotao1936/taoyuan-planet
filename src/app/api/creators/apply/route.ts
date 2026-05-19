import { NextRequest, NextResponse } from 'next/server';
import { getApplications, createApplication, updateApplication } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (userId) {
    const apps = getApplications().filter(a => a.userId === parseInt(userId));
    const latest = apps.sort((a, b) => b.id - a.id)[0];
    return NextResponse.json({ application: latest || null });
  }
  return NextResponse.json(getApplications());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const apps = getApplications();
  const application = {
    ...body,
    id: Math.max(0, ...apps.map(a => a.id)) + 1,
    status: 'pending' as const,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  createApplication(application);
  return NextResponse.json(application, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: '缺少申请 ID' }, { status: 400 });
  const updated = updateApplication(id, data);
  if (!updated) return NextResponse.json({ error: '申请未找到' }, { status: 404 });
  return NextResponse.json(updated);
}
