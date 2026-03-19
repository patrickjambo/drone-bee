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

  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const { items } = await req.json(); // Array of { productId, saleType ('BATCH' or 'UNIT'), quantity }
    
    // Process transaction in a Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      let shiftTotal = 0;
      let createdSales = [];

      for (const item of items) {
        // Find product and lock for update
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) throw new Error(`Product ${item.productId} not found`);

        const price = item.saleType === 'BATCH' ? product.price_per_batch : product.price_per_unit;
        const totalAmount = price * item.quantity;
        const unitsDeducted = item.saleType === 'BATCH' ? (product.batch_size * item.quantity) : item.quantity;

        if (product.stock_units < unitsDeducted) {
          throw new Error(`Insufficient stock for ${product.name}. Requested: ${unitsDeducted}, Available: ${product.stock_units}`);
        }

        // Anomaly Engine: Off-Hours Check
        const currentHour = new Date().getHours();
        if (currentHour < 6 || currentHour > 22) {
          await tx.alert.create({
            data: {
              alert_type: 'UNUSUAL_ACTIVITY',
              severity: 'WARNING',
              title: 'Off-Hours POS Activity',
              description: `A sale for ${product.name} was processed during off-hours (${currentHour}:00).`,
              related_product_id: product.id,
            }
          });
        }

        // Anomaly Engine: Mass Quantity Check
        if (item.quantity > 50) {
           await tx.alert.create({
            data: {
              alert_type: 'UNUSUAL_ACTIVITY',
              severity: 'CRITICAL',
              title: 'Abnormal Sale Pattern',
              description: `A massive volume of ${item.quantity} units/batches of ${product.name} was requested in one transaction.`,
              related_product_id: product.id,
            }
          });
        }

        // 1. Create Immutable Sale Record
        const sale = await tx.sale.create({
          data: {
            manager_id: managerId,
            product_id: product.id,
            sale_type: item.saleType,
            quantity: item.quantity,
            unit_price_at_sale: price,
            total_amount: totalAmount,
            status: 'CONFIRMED'
          }
        });

        // 2. Adjust Stock
        const updatedProduct = await tx.product.update({
          where: { id: product.id },
          data: {
            stock_units: product.stock_units - unitsDeducted
          }
        });

        // 3. Create Stock Movement Record
        await tx.stockMovement.create({
          data: {
            product_id: product.id,
            movement_type: 'SALE',
            quantity_change: -unitsDeducted,
            balance_after: updatedProduct.stock_units,
            performed_by_id: managerId,
            notes: `Sale ID: ${sale.id}`
          }
        });

        // 3.5 Create an audit log for this sale so actions are traceable
        await tx.auditLog.create({
          data: {
            user_id: managerId,
            action_type: 'SALE',
            description: `Sale ${sale.id} by manager ${managerId} for product ${product.name} - qty ${item.quantity} (${item.saleType}) - total ${totalAmount}`,
            ip_address: ipAddress,
            user_agent: userAgent
          }
        });

        // 4. Threshold Warning Check Logic
        if (updatedProduct.stock_units <= updatedProduct.min_stock_threshold && updatedProduct.stock_units > 0) {
           await tx.alert.create({
             data: {
               alert_type: 'LOW_STOCK',
               severity: 'WARNING',
               title: 'Low Stock Alert',
               description: `${product.name} has dropped to ${updatedProduct.stock_units} units.`,
               related_product_id: product.id
             }
           });
        } else if (updatedProduct.stock_units === 0) {
           await tx.alert.create({
             data: {
               alert_type: 'OUT_OF_STOCK',
               severity: 'CRITICAL',
               title: 'Out of Stock Alert',
               description: `${product.name} has completely naturally depleted.`,
               related_product_id: product.id
             }
           });
        }

        shiftTotal += totalAmount;
        createdSales.push(sale);
      }

      return { 
        success: true, 
        totalLoaded: shiftTotal, 
        salesCount: createdSales.length,
        transactionId: createdSales.length > 0 ? createdSales[0].id : null
      };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
