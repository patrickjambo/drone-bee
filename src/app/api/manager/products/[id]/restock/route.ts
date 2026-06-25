import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function authManager() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_development_only') as any;
    if (payload.role !== 'MANAGER' && payload.role !== 'SUPERADMIN') return null;
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await authManager();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { quantity, notes } = await request.json();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      return NextResponse.json({ error: 'Invalid restock quantity.' }, { status: 400 });
    }

    const { id: productId } = await params;

    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('remote-addr') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock_units: { increment: qty } },
      });

      await tx.stockMovement.create({
        data: {
          product_id: productId,
          movement_type: 'RESTOCK',
          quantity_change: qty,
          balance_after: updatedProduct.stock_units,
          notes: notes?.trim() || 'Manual restock via Manager portal',
          performed_by_id: userId,
        },
      });

      // A large unexpected restock raises an anomaly alert for the admin.
      if (qty > 100) {
        await tx.alert.create({
          data: {
            alert_type: 'UNUSUAL_ACTIVITY',
            severity: 'WARNING',
            title: 'Large Restock Recorded',
            description: `${qty} units of ${product.name} were added in a single restock.`,
            related_product_id: productId,
            related_manager_id: userId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          user_id: userId,
          action_type: 'RESTOCK_PRODUCT',
          description: `Added ${qty} units to ${product.name}. Old stock: ${product.stock_units}, New: ${updatedProduct.stock_units}`,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Restock API error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
