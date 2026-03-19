const fs = require('fs');
const filepath = 'src/app/api/manager/dashboard/route.ts';
let code = fs.readFileSync(filepath, 'utf8');

// We want to add hourly fetching.
const fetchHoursLogic = `
      // Analytics graph data
      const allTodaySales = await prisma.sale.findMany({
        where: { manager_id: managerId, created_at: { gte: today } },
        select: { created_at: true, total_amount: true }
      });

      // Group by hour
      const hourlyData = Array.from({length: 12}, (_, i) => ({ hour: 8 + i, amount: 0 }));
      
      allTodaySales.forEach(s => {
        const h = s.created_at.getHours();
        const index = h - 8;
        if (index >= 0 && index < 12) {
          hourlyData[index].amount += s.total_amount;
        }
      });
`;

if (!code.includes('hourlyData')) {
    code = code.replace(
      'prisma.product.findMany({ select: { stock_units: true, min_stock_threshold: true } })',
      `prisma.product.findMany({ select: { stock_units: true, min_stock_threshold: true } }),
      prisma.sale.findMany({
        where: { manager_id: managerId, created_at: { gte: today } },
        select: { created_at: true, total_amount: true }
      })`
    );

    code = code.replace(
      'const realInStock = allProducts.filter(p => p.stock_units > 0).length;',
      `const realInStock = allProducts.filter(p => p.stock_units > 0).length;

    const allTodaySales = arguments[1] ? [] : []; // Wait, the array returned by Promise.all
    `
    );
}
