/* eslint-disable no-param-reassign */
import { db } from '@/lib/db';
import { getUserId } from '@/utils/get-session';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const getStatics = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const suppliersCount = await db.supplier.count({
      where: { userId },
    });

    const purchaseInvoices = await db.purchaseInvoice.findMany({
      where: { userId },
      select: { total: true, paid: true },
    });

    const saleInvoices = await db.saleInvoice.findMany({
      where: { userId },
      select: { total: true, paid: true },
    });

    const expenses = await db.expense.findMany({
      where: { userId },
      select: { amount: true, category: true },
    });

    const payments = await db.payment.findMany({
      where: { userId },
      select: { amount: true, type: true, date: true },
    });

    const purchaseInvoiceStats = {
      totalInvoices: purchaseInvoices.length,
      totalAmount: purchaseInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
      totalPaid: purchaseInvoices.reduce((sum, invoice) => sum + invoice.paid, 0),
      totalRemaining: purchaseInvoices.reduce(
        (sum, invoice) => sum + (invoice.total - invoice.paid),
        0,
      ),
    };

    const saleInvoiceStats = {
      totalInvoices: saleInvoices.length,
      totalAmount: saleInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
      totalPaid: saleInvoices.reduce((sum, invoice) => sum + invoice.paid, 0),
      totalRemaining: saleInvoices.reduce(
        (sum, invoice) => sum + (invoice.total - invoice.paid),
        0,
      ),
    };

    const expenseStats = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      byCategory: expenses.reduce<Record<string, number>>((categories, expense) => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
        return categories;
      }, {}),
    };

    const paymentStats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      byType: payments.reduce<Record<string, number>>((types, payment) => {
        types[payment.type] = (types[payment.type] || 0) + payment.amount;
        return types;
      }, {}),
      recentPayments: payments.slice(-5).reverse(),
    };

    return NextResponse.json({
      message: 'Success retrieving statistics',
      details: {
        suppliersCount,
        purchaseInvoiceStats,
        saleInvoiceStats,
        expenseStats,
        paymentStats,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid parameters',
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error while fetching statistics',
      },
      { status: 500 },
    );
  }
};
