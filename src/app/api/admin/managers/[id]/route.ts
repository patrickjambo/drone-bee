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
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'MANAGER') return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    const data: any = {};
    if (body.is_blocked !== undefined) data.is_blocked = !!body.is_blocked;
    if (body.full_name !== undefined) data.full_name = String(body.full_name).trim();
    if (body.shift_start !== undefined) data.shift_start = body.shift_start;
    if (body.shift_end !== undefined) data.shift_end = body.shift_end;
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, full_name: true, username: true, shift_start: true, shift_end: true, phone: true, is_blocked: true },
    });

    await prisma.auditLog.create({
      data: {
        user_id: adminId,
        action_type: data.is_blocked !== undefined ? (data.is_blocked ? 'BLOCK_AGENT' : 'UNBLOCK_AGENT') : 'UPDATE_AGENT',
        description: `Updated agent ${existing.username}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update agent error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'MANAGER') return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    await prisma.user.update({ where: { id }, data: { is_deleted: true, is_blocked: true } });

    await prisma.auditLog.create({
      data: {
        user_id: adminId,
        action_type: 'DELETE_AGENT',
        description: `Removed agent ${existing.username}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete agent error:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove agent' }, { status: 500 });
  }
}
