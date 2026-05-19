import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const creatorId = searchParams.get('creatorId');
  const keyword = searchParams.get('keyword');
  const sort = searchParams.get('sort') || 'default';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  let products = getProducts();

  if (categoryId) {
    products = products.filter(p => p.categoryId === parseInt(categoryId));
  }
  if (creatorId) {
    products = products.filter(p => p.creatorId === parseInt(creatorId));
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      p.tags.some(t => t.toLowerCase().includes(kw)) ||
      p.description.toLowerCase().includes(kw)
    );
  }

  switch (sort) {
    case 'sales': products.sort((a, b) => b.salesCount - a.salesCount); break;
    case 'newest': products.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    case 'price-asc': products.sort((a, b) => a.price - b.price); break;
    case 'price-desc': products.sort((a, b) => b.price - a.price); break;
  }

  const total = products.length;
  const start = (page - 1) * pageSize;
  const items = products.slice(start, start + pageSize);

  return NextResponse.json({ items, total, page, pageSize, hasMore: start + pageSize < total });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const products = getProducts();
  const newProduct = {
    ...body,
    id: Math.max(0, ...products.map(p => p.id)) + 1,
    salesCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'draft',
  };
  createProduct(newProduct);
  return NextResponse.json(newProduct, { status: 201 });
}
