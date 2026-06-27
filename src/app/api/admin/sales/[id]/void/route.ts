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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await authAdmin();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await params;
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id }, include: { product: true } });
      if (!sale) throw new Error('Sale not found');
      if (sale.status === 'VOIDED') throw new Error('Sale is already voided');

      // Units to return: a batch sale removed batch_size * qty units.
      const units = sale.sale_type === 'BATCH' ? sale.product.batch_size * sale.quantity : sale.quantity;

      const updatedProduct = await tx.product.update({
        where: { id: sale.product_id },
        data: { stock_units: { increment: units } },
      });

      await tx.sale.update({ where: { id }, data: { status: 'VOIDED' } });

      await tx.stockMovement.create({
        data: {
          product_id: sale.product_id,
          movement_type: 'ADJUSTMENT',
          quantity_change: units,
          balance_after: updatedProduct.stock_units,
          notes: `Void of sale ${id} — stock returned`,
          performed_by_id: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          user_id: userId,
          action_type: 'VOID_SALE',
          description: `Voided sale ${id} for ${sale.product.name} (qty ${sale.quantity} ${sale.sale_type}); restored ${units} units.`,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });

      return { success: true, restored: units };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Void sale error:', error);
    return NextResponse.json({ error: error.message || 'Failed to void sale' }, { status: 400 });
  }
}
