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
    return payload.userId;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER', is_deleted: false },
      select: { id: true, full_name: true, username: true, shift_start: true, shift_end: true, phone: true, is_blocked: true }
    });
    return NextResponse.json(managers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { full_name, username, shift_start, shift_end, phone, password } = await req.json();

    // Use provided password or generate a secure 8-character random temporary password
    const temporaryPassword = password || crypto.randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const newManager = await prisma.user.create({
      data: {
        full_name: full_name || username,
        username,
        shift_start: shift_start || '08:00',
        shift_end: shift_end || '17:00',
        phone: phone || 'N/A',
        password_hash: passwordHash,
        role: 'MANAGER',
        created_by_id: adminId
      }
    });

    // Logging the creation
    await prisma.auditLog.create({
      data: {
        user_id: adminId,
        action_type: 'CREATE_MANAGER',
        description: `Created manager account: ${username}`,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      }
    });

    return NextResponse.json({ username: newManager.username, temporaryPassword }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create manager. Username might be taken.' }, { status: 500 });
  }
}
