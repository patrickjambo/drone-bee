import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function authAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_development_only') as any;
    if (payload.role !== 'SUPERADMIN') return null;
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'MANAGER') return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    const temporaryPassword = body.password?.trim() || crypto.randomBytes(4).toString('hex');
    const password_hash = await bcrypt.hash(temporaryPassword, 12);

    await prisma.user.update({ where: { id }, data: { password_hash } });

    await prisma.auditLog.create({
      data: {
        user_id: adminId,
        action_type: 'RESET_AGENT_PASSWORD',
        description: `Reset password for agent ${existing.username}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ username: existing.username, temporaryPassword });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reset password' }, { status: 500 });
  }
}
