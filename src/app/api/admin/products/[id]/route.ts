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
  const userId = await authAdmin();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const data: any = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.honey_type !== undefined) data.honey_type = String(body.honey_type).trim();
    if (body.origin !== undefined) data.origin = body.origin?.trim() || null;
    if (body.image_url !== undefined) data.image_url = body.image_url?.trim() || null;
    if (body.batch_size !== undefined) data.batch_size = parseInt(body.batch_size);
    if (body.price_per_unit !== undefined) data.price_per_unit = parseFloat(body.price_per_unit);
    if (body.price_per_batch !== undefined) data.price_per_batch = parseFloat(body.price_per_batch);
    if (body.min_stock_threshold !== undefined) data.min_stock_threshold = parseInt(body.min_stock_threshold);
    if (body.is_active !== undefined) data.is_active = !!body.is_active;

    const updated = await prisma.product.update({ where: { id }, data });

    // Record price changes for audit (PriceHistory).
    const unitChanged = data.price_per_unit !== undefined && data.price_per_unit !== existing.price_per_unit;
    const batchChanged = data.price_per_batch !== undefined && data.price_per_batch !== existing.price_per_batch;
    if (unitChanged || batchChanged) {
      await prisma.priceHistory.create({
        data: {
          product_id: id,
          old_unit_price: existing.price_per_unit,
          new_unit_price: updated.price_per_unit,
          old_batch_price: existing.price_per_batch,
          new_batch_price: updated.price_per_batch,
          changed_by_id: userId,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action_type: 'UPDATE_PRODUCT',
        description: `Updated product "${updated.name}"${unitChanged ? ` · unit price ${existing.price_per_unit} → ${updated.price_per_unit}` : ''}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}
