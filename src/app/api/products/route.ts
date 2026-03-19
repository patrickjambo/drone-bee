import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Public/Manager route to get active products only
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
