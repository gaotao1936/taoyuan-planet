import { NextRequest, NextResponse } from 'next/server';
import { getCreatorById, updateCreator } from '@/lib/store';
import { getProducts } from '@/lib/store';
import { getPosts } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const creator = getCreatorById(parseInt(id));
  if (!creator) return NextResponse.json({ error: '创作者未找到' }, { status: 404 });

  const products = getProducts().filter(p => p.creatorId === creator.id);
  const posts = getPosts().filter(p => p.userId === creator.id);

  return NextResponse.json({
    ...creator,
    products,
    posts,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateCreator(parseInt(id), body);
  if (!updated) return NextResponse.json({ error: '创作者未找到' }, { status: 404 });
  return NextResponse.json(updated);
}
