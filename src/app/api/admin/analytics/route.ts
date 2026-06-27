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

export async function GET(req: Request) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10), 1), 90);

  try {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: { created_at: { gte: since }, status: 'CONFIRMED' },
      include: { product: { select: { name: true, honey_type: true } }, manager: { select: { full_name: true } } },
    });

    const totalRevenue = sales.reduce((a, s) => a + s.total_amount, 0);
    const totalUnits = sales.reduce((a, s) => a + s.quantity, 0);
    const count = sales.length;
    const avg = count ? Math.round(totalRevenue / count) : 0;

    // Daily trend
    const dayMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    sales.forEach(s => {
      const key = new Date(s.created_at).toISOString().slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + s.total_amount);
    });
    const trend = Array.from(dayMap.entries()).map(([date, revenue]) => ({ date, revenue }));

    // Top products
    const prodMap = new Map<string, { name: string; type: string; revenue: number; qty: number }>();
    sales.forEach(s => {
      const key = s.product_id;
      const e = prodMap.get(key) || { name: s.product?.name || 'Unknown', type: s.product?.honey_type || '', revenue: 0, qty: 0 };
      e.revenue += s.total_amount; e.qty += s.quantity;
      prodMap.set(key, e);
    });
    const topProducts = Array.from(prodMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    // By manager
    const mgrMap = new Map<string, { name: string; revenue: number; count: number }>();
    sales.forEach(s => {
      const key = s.manager_id;
      const e = mgrMap.get(key) || { name: s.manager?.full_name || 'Agent', revenue: 0, count: 0 };
      e.revenue += s.total_amount; e.count += 1;
      mgrMap.set(key, e);
    });
    const byManager = Array.from(mgrMap.values()).sort((a, b) => b.revenue - a.revenue);

    // By hour (0-23)
    const hours = Array.from({ length: 24 }, () => 0);
    sales.forEach(s => { hours[new Date(s.created_at).getHours()] += s.total_amount; });

    return NextResponse.json({ totalRevenue, totalUnits, count, avg, days, trend, topProducts, byManager, hours });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
