import { NextRequest, NextResponse } from 'next/server';
import { getCreators } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  let creators = getCreators();

  if (keyword) {
    const kw = keyword.toLowerCase();
    creators = creators.filter(c =>
      c.name.toLowerCase().includes(kw) ||
      c.tags?.some(t => t.toLowerCase().includes(kw)) ||
      c.bio.toLowerCase().includes(kw)
    );
  }

  const total = creators.length;
  const start = (page - 1) * pageSize;
  const items = creators.slice(start, start + pageSize);

  return NextResponse.json({ items, total, page, pageSize, hasMore: start + pageSize < total });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: '请使用 /api/creators/apply 申请成为创作者' }, { status: 400 });
}
