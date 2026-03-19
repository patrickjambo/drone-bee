import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Authenticate helper
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
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const body = await req.json();
    const { name, honey_type, origin, batch_size, price_per_batch, price_per_unit, stock_units, min_stock_threshold } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        honey_type,
        origin,
        batch_size: parseInt(batch_size),
        price_per_batch: parseFloat(price_per_batch),
        price_per_unit: parseFloat(price_per_unit),
        stock_units: parseInt(stock_units),
        min_stock_threshold: parseInt(min_stock_threshold),
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        user_id: adminId,
        action_type: 'CREATE_PRODUCT',
        description: `Created new product: ${name}`,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
