import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function authAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_development_only') as any;
    if (payload.role !== 'SUPERADMIN') return null;
    return payload.userId;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    // Get last 50 sales for the live feed, including related product and manager names
    const sales = await prisma.sale.findMany({
      take: 50,
      orderBy: { created_at: 'desc' },
      include: {
        product: { select: { name: true, honey_type: true } },
        manager: { select: { full_name: true, username: true } }
      }
    });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales feed' }, { status: 500 });
  }
}
