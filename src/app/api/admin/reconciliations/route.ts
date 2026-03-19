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
    return payload.userId;
  } catch (err) {
    return null;
  }
}

// GET: return a summary of today's units sold per product and tentative opening/expected values
export async function GET() {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    // aggregate units sold today per product
    const sales = await prisma.sale.groupBy({
      by: ['product_id'],
      where: { created_at: { gte: start, lte: end }, status: 'CONFIRMED' },
      _sum: { quantity: true }
    });

    // load products and map
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });

    const summary = products.map((p) => {
      const s = sales.find(x => x.product_id === p.id);
      const units_sold = s?._sum?.quantity ?? 0;
      // naive opening estimate: current stock + units_sold (assumes no restocks during day)
      const opening_estimate = p.stock_units + units_sold;
      const expected_closing = p.stock_units;

      return {
        product_id: p.id,
        name: p.name,
        opening_estimate,
        units_sold,
        expected_closing
      };
    });

    // create DailyReconciliation rows where missing
    for (const row of summary) {
      const existing = await prisma.dailyReconciliation.findFirst({ where: { product_id: row.product_id, date: start } });
      if (!existing) {
        await prisma.dailyReconciliation.create({
          data: {
            date: start,
            product_id: row.product_id,
            opening_stock: row.opening_estimate,
            units_sold: row.units_sold,
            expected_closing: row.expected_closing
          }
        });
      }
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('reconciliation error', error);
    return NextResponse.json({ error: 'Failed to compute reconciliations' }, { status: 500 });
  }
}

// POST: finalize actual closings. Expect payload [{ product_id, actual_closing }]
export async function POST(req: Request) {
  const adminId = await authAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const payload = await req.json();
    const start = new Date();
    start.setHours(0,0,0,0);

    const results: any[] = [];
    for (const item of payload) {
      const existing = await prisma.dailyReconciliation.findFirst({
        where: { product_id: item.product_id, date: start }
      });
      
      if (existing) {
        const actual = item.actual_closing ?? existing.expected_closing;
        const updated = await prisma.dailyReconciliation.update({
          where: { id: existing.id },
          data: {
            actual_closing: actual,
            discrepancy: actual - existing.expected_closing
          }
        });
        results.push({ product_id: item.product_id, updated: 1, discrepancy: updated.discrepancy });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('reconciliation finalize error', error);
    return NextResponse.json({ error: 'Failed to finalize reconciliations' }, { status: 500 });
  }
}
 
