import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, Permissions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, Permissions.canViewCars);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all cars
    const allCars = await prisma.car.findMany({
      include: {
        repairs: true,
        expenses: true,
      },
    });

    // Total cars by status
    const totalCars = allCars.length;
    const purchased = allCars.filter(c => c.status === 'PURCHASED').length;
    const inRepair = allCars.filter(c => c.status === 'IN_REPAIR').length;
    const readyForSale = allCars.filter(c => c.status === 'READY_FOR_SALE').length;
    const sold = allCars.filter(c => c.status === 'SOLD' || c.status === 'DELIVERED').length;

    // This month stats
    const carsThisMonth = allCars.filter(c => 
      new Date(c.purchaseDate) >= startOfMonth
    );
    const soldThisMonth = allCars.filter(c => 
      c.saleDate && new Date(c.saleDate) >= startOfMonth
    );

    // Last month stats
    const soldLastMonth = allCars.filter(c => 
      c.saleDate && 
      new Date(c.saleDate) >= startOfLastMonth && 
      new Date(c.saleDate) <= endOfLastMonth
    );

    // Financial calculations
    const totalInvestment = allCars.reduce((sum, car) => {
      const repairCosts = car.repairs.reduce((s, r) => s + r.cost, 0);
      const expenseCosts = car.expenses.reduce((s, e) => s + e.amount, 0);
      return sum + car.purchasePrice + repairCosts + expenseCosts;
    }, 0);

    const totalRevenue = allCars
      .filter(c => c.salePrice)
      .reduce((sum, car) => sum + (car.salePrice || 0), 0);

    const revenueThisMonth = soldThisMonth.reduce((sum, car) => 
      sum + (car.salePrice || 0), 0
    );

    const revenueLastMonth = soldLastMonth.reduce((sum, car) => 
      sum + (car.salePrice || 0), 0
    );

    // Profit calculations (simplified - revenue minus costs for sold cars)
    const soldCars = allCars.filter(c => c.salePrice);
    const totalProfit = soldCars.reduce((sum, car) => {
      const repairCosts = car.repairs.reduce((s, r) => s + r.cost, 0);
      const expenseCosts = car.expenses.reduce((s, e) => s + e.amount, 0);
      const totalCost = car.purchasePrice + repairCosts + expenseCosts;
      return sum + ((car.salePrice || 0) - totalCost);
    }, 0);

    const profitThisMonth = soldThisMonth.reduce((sum, car) => {
      const repairCosts = car.repairs.reduce((s, r) => s + r.cost, 0);
      const expenseCosts = car.expenses.reduce((s, e) => s + e.amount, 0);
      const totalCost = car.purchasePrice + repairCosts + expenseCosts;
      return sum + ((car.salePrice || 0) - totalCost);
    }, 0);

    // Average metrics
    const avgPurchasePrice = totalCars > 0 
      ? allCars.reduce((sum, c) => sum + c.purchasePrice, 0) / totalCars 
      : 0;

    const avgSalePrice = soldCars.length > 0
      ? soldCars.reduce((sum, c) => sum + (c.salePrice || 0), 0) / soldCars.length
      : 0;

    const avgProfit = soldCars.length > 0 ? totalProfit / soldCars.length : 0;

    // Inventory value (cars not sold yet)
    const inventoryCars = allCars.filter(c => c.status !== 'SOLD' && c.status !== 'DELIVERED');
    const inventoryValue = inventoryCars.reduce((sum, car) => {
      const repairCosts = car.repairs.reduce((s, r) => s + r.cost, 0);
      const expenseCosts = car.expenses.reduce((s, e) => s + e.amount, 0);
      return sum + car.purchasePrice + repairCosts + expenseCosts;
    }, 0);

    // Get accounts balance
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { isActive: true },
    });
    const cashAccount = await prisma.cashAccount.findFirst();

    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalCash = cashAccount?.balance || 0;
    const totalLiquidity = totalBankBalance + totalCash;

    return NextResponse.json({
      overview: {
        totalCars,
        purchased,
        inRepair,
        readyForSale,
        sold,
      },
      thisMonth: {
        carsPurchased: carsThisMonth.length,
        carsSold: soldThisMonth.length,
        revenue: revenueThisMonth,
        profit: profitThisMonth,
      },
      lastMonth: {
        carsSold: soldLastMonth.length,
        revenue: revenueLastMonth,
      },
      financial: {
        totalInvestment,
        totalRevenue,
        totalProfit,
        inventoryValue,
        totalLiquidity,
        totalBankBalance,
        totalCash,
      },
      averages: {
        purchasePrice: avgPurchasePrice,
        salePrice: avgSalePrice,
        profit: avgProfit,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
