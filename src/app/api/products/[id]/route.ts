import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProductById(parseInt(id));
  if (!product) return NextResponse.json({ error: '作品未找到' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateProduct(parseInt(id), body);
  if (!updated) return NextResponse.json({ error: '作品未找到' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteProduct(parseInt(id));
  if (!deleted) return NextResponse.json({ error: '作品未找到' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
