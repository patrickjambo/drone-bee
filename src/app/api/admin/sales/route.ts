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

export async function GET(req: Request) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100', 10), 1), 500);

    const where: any = {};
    if (status === 'VOIDED') where.status = 'VOIDED';
    else if (status === 'CONFIRMED') where.status = 'CONFIRMED';
    else if (status === 'flagged') where.flagged = true;

    const sales = await prisma.sale.findMany({
      where,
      take: limit,
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
