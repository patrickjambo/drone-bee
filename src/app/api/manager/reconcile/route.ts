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

export async function POST(req: Request) {
  const managerId = await authManager();
  if (!managerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const body = await req.json();
    const { items } = body;

    // Run reconciliation inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      let totalDiscrepancies = 0;
      
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const expectedClosing = product.stock_units;
        const actualClosing = item.actualStock;
        const discrepancy = actualClosing - expectedClosing;

        // Create the reconciliation record
        await tx.dailyReconciliation.create({
          data: {
            product_id: product.id,
            opening_stock: product.stock_units, // Using current stock as pseudo-opening for this simple implementation
            expected_closing: expectedClosing,
            actual_closing: actualClosing,
            discrepancy: discrepancy
          }
        });

        if (discrepancy !== 0) {
          totalDiscrepancies++;
          
          let severity: "WARNING" | "CRITICAL" | "INFO" = "WARNING";
          if (Math.abs(discrepancy) > 10) severity = "CRITICAL";

          await tx.alert.create({
            data: {
              alert_type: 'RECONCILIATION_DISCREPANCY',
              severity,
              title: `Stock Discrepancy: ${product.name}`,
              description: `Expected ${expectedClosing} units, but counted ${actualClosing} units. Discrepancy: ${discrepancy}.`,
              related_product_id: product.id,
              related_manager_id: managerId
            }
          });
          
          // Optionally adjust the stock depending on business rules? 
          // SRS: Usually reconciliation updates stock, creating a StockMovement
          await tx.product.update({
            where: { id: product.id },
            data: { stock_units: actualClosing }
          });

          await tx.stockMovement.create({
            data: {
              product_id: product.id,
              movement_type: 'AUDIT_CORRECTION',
              quantity_change: discrepancy,
              balance_after: actualClosing,
              performed_by_id: managerId,
              notes: 'Daily Reconciliation Correction'
            }
          });
        }
      }

      return { success: true, discrepancies: totalDiscrepancies };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Reconciliation error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
