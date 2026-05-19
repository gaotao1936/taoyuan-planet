import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'newest';
  const keyword = searchParams.get('keyword');
  const userId = searchParams.get('userId');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  let posts = getPosts();

  if (keyword) {
    const kw = keyword.toLowerCase();
    posts = posts.filter(p =>
      p.content.toLowerCase().includes(kw) ||
      p.tags?.some(t => t.toLowerCase().includes(kw))
    );
  }
  if (userId) {
    posts = posts.filter(p => p.userId === parseInt(userId));
  }

  switch (sort) {
    case 'hot': posts.sort((a, b) => b.likes - a.likes); break;
    case 'newest':
    default: posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
  }

  const total = posts.length;
  const start = (page - 1) * pageSize;
  const items = posts.slice(start, start + pageSize);

  return NextResponse.json({ items, total, page, pageSize, hasMore: start + pageSize < total });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const posts = getPosts();
  const newPost = {
    ...body,
    id: Math.max(0, ...posts.map(p => p.id)) + 1,
    likes: 0,
    liked: false,
    collected: false,
    comments: [],
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  createPost(newPost);
  return NextResponse.json(newPost, { status: 201 });
}
