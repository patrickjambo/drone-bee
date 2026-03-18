import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { quantity } = await request.json();
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid restock quantity.' }, { status: 400 });
    }

    const resolvedParams = await params;
    const productId = resolvedParams.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('dronebee_auth')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = payload.userId as string;

    const result = await prisma.$transaction(async (tx: any) => {
      // Get current product
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock_units: { increment: quantity } }
      });

      // Log movement
      await tx.stockMovement.create({
        data: {
          product_id: productId,
          movement_type: 'RESTOCK',
          quantity: quantity,
          notes: 'Manual restock via Admin portal',
          recorded_by_id: userId
        }
      });

      // Log audit
      await tx.auditLog.create({
        data: {
          action: 'Product Restocked',
          details: `Added ${quantity} units to ${product.name}. Old stock: ${product.stock_units}, New: ${updatedProduct.stock_units}`,
          user_id: userId,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown',
          user_agent: request.headers.get('user-agent') || 'Unknown'
        }
      });

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Restock API error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
