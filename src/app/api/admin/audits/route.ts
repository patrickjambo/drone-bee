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

  const { searchParams } = new URL(req.url);
  const actionType = searchParams.get('action');
  const userId = searchParams.get('user');

  try {
    const where: any = {};
    if (actionType) where.action_type = actionType;
    if (userId) where.user_id = userId;

    const audits = await prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 200,
      include: {
        user: { select: { full_name: true, username: true } }
      }
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.error('Fetch audits error:', error);
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
  }
}
