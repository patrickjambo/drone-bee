import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'This Week'; // Today, Yesterday, This Week, This Month

    const now = new Date();
    let startDate = new Date();
    
    if (range === 'Today') {
      startDate.setHours(0,0,0,0);
    } else if (range === 'Yesterday') {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0,0,0,0);
    } else if (range === 'This Week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'This Month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setHours(0,0,0,0);
    }

    const endDate = range === 'Yesterday' ? new Date(startDate.getTime() + 86400000) : now;

    const sales = await prisma.sale.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        status: 'CONFIRMED'
      },
      include: {
        product: true
      }
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const itemsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
    const avgTransaction = sales.length ? (totalRevenue / sales.length).toFixed(0) : 0;
    
    // Simulate Profit (say 30% margin for simple demo if not tracked)
    const netProfit = totalRevenue * 0.3;

    // Top products
    const productStats: any = {};
    sales.forEach(s => {
      if (!productStats[s.product_id]) {
        productStats[s.product_id] = {
          name: s.product.name,
          type: s.product.honey_type,
          sales: 0,
          rev: 0
        };
      }
      productStats[s.product_id].sales += s.quantity;
      productStats[s.product_id].rev += s.total_amount;
    });

    const topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.rev - a.rev)
      .slice(0, 4)
      .map((p: any) => {
         const pct = totalRevenue > 0 ? (p.rev / totalRevenue) * 100 : 0;
         return {
           name: p.name,
           type: p.type,
           sales: p.sales,
           rev: p.rev,
           pct: Math.min(Math.max(pct, 5), 100) // Ensure something renders
         }
      });

    // Trend (Last 7 days mock or real data)
    // For real data we group by day
    const trend = [0,0,0,0,0,0,0];
    sales.forEach(s => {
       const d = new Date(s.created_at);
       const dayDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
       if (dayDiff >= 0 && dayDiff < 7) {
          trend[6 - dayDiff] += s.total_amount;
       }
    });

    // Normalize trend to max 100 for percentages
    const maxTrend = Math.max(...trend, 1);
    const normalizedTrend = trend.map(t => (t / maxTrend) * 100);

    return NextResponse.json({
      totalRevenue,
      netProfit,
      itemsSold,
      avgTransaction,
      topProducts,
      trend: normalizedTrend,
      rawSales: sales // To export CSV
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
