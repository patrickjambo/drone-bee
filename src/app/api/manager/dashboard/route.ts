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
    if (payload.role !== 'MANAGER') return null;
    return payload.userId;
  } catch (err) {
    return null;
  }
}

export async function GET(req: Request) {
  const managerId = await authManager();
  if (!managerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      salesCount,
      salesSum,
      recentTransactions,
      allProducts,
      todaySales
    ] = await Promise.all([
      prisma.sale.count({
        where: { manager_id: managerId, created_at: { gte: today } }
      }),
      prisma.sale.aggregate({
        _sum: { total_amount: true },
        where: { manager_id: managerId, created_at: { gte: today } }
      }),
      prisma.sale.findMany({
        where: { manager_id: managerId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: { product: true }
      }),
      prisma.product.findMany({ select: { stock_units: true, min_stock_threshold: true } }),
      prisma.sale.findMany({
        where: { manager_id: managerId, created_at: { gte: today } },
        select: { created_at: true, total_amount: true }
      })
    ]);

    const realLowStock = allProducts.filter(p => p.stock_units > 0 && p.stock_units <= p.min_stock_threshold).length;
    const realOut = allProducts.filter(p => p.stock_units === 0).length;
    const realInStock = allProducts.filter(p => p.stock_units > 0).length;

    const hourlyData = [0,0,0,0,0,0,0]; // Map to 8am, 10am, 12pm, 2pm, 4pm, 6pm, 8pm
    let maxHourAmount = 0;

    todaySales.forEach(s => {
       const h = s.created_at.getHours();
       let bucket = 0;
       if (h < 10) bucket = 0; // 8AM
       else if (h < 12) bucket = 1; // 10AM
       else if (h < 14) bucket = 2; // 12PM
       else if (h < 16) bucket = 3; // 2PM
       else if (h < 18) bucket = 4; // 4PM
       else if (h < 20) bucket = 5; // 6PM
       else bucket = 6; // 8PM +

       hourlyData[bucket] += s.total_amount;
       if (hourlyData[bucket] > maxHourAmount) maxHourAmount = hourlyData[bucket];
    });

    // Normalize safely to 0-100 for SVG
    const chartPoints = hourlyData.map(amt => maxHourAmount > 0 ? Math.round((amt / maxHourAmount) * 100) : 0);

    return NextResponse.json({
      stats: {
        todaySales: salesCount,
        revenue: salesSum._sum.total_amount || 0,
        inStock: realInStock,
        lowStockQty: realLowStock,
        outOfStockQty: realOut,
        offlineQueue: 0
      },
      chartData: chartPoints,
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        productName: tx.product.name,
        quantity: tx.quantity,
        saleType: tx.sale_type,
        totalAmount: tx.total_amount,
        createdAt: tx.created_at
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
