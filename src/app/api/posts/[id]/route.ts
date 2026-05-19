import { NextRequest, NextResponse } from 'next/server';
import { getPostById, deletePost, togglePostLike, togglePostCollect, addComment } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = getPostById(parseInt(id));
  if (!post) return NextResponse.json({ error: '帖子未找到' }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deletePost(parseInt(id));
  if (!deleted) return NextResponse.json({ error: '帖子未找到' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  if (action === 'like') {
    const post = togglePostLike(parseInt(id));
    if (!post) return NextResponse.json({ error: '帖子未找到' }, { status: 404 });
    return NextResponse.json(post);
  }
  if (action === 'collect') {
    const post = togglePostCollect(parseInt(id));
    if (!post) return NextResponse.json({ error: '帖子未找到' }, { status: 404 });
    return NextResponse.json(post);
  }
  if (action === 'comment' && body.content) {
    const comment = {
      id: Date.now(),
      userId: body.userId || 0,
      userName: body.userName || '匿名用户',
      content: body.content,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    const post = addComment(parseInt(id), comment);
    if (!post) return NextResponse.json({ error: '帖子未找到' }, { status: 404 });
    return NextResponse.json(post);
  }

  return NextResponse.json({ error: '无效操作' }, { status: 400 });
}
