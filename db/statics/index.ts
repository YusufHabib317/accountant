/* eslint-disable no-param-reassign */

import { db } from '@/lib/db';
import { z } from 'zod';

export const getStatics = async () => {
  try {
    const suppliersCount = await db.supplier.count();

    const purchaseInvoices = await db.purchaseInvoice.findMany({
      select: {
        total: true,
        paid: true,
      },
    });

    const saleInvoices = await db.saleInvoice.findMany({
      select: {
        total: true,
        paid: true,
      },
    });

    const expenses = await db.expense.findMany({
      select: {
        amount: true,
        category: true,
      },
    });

    const payments = await db.payment.findMany({
      select: {
        amount: true,
        type: true,
        date: true,
      },
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

    type CategoryAccumulator = Record<string, number>;

    const expenseStats = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      byCategory: expenses.reduce<CategoryAccumulator>((categories, expense) => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
        return categories;
      }, {}),
    };

    type PaymentTypeAccumulator = Record<string, number>;

    const paymentStats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      byType: payments.reduce<PaymentTypeAccumulator>((types, payment) => {
        types[payment.type] = (types[payment.type] || 0) + payment.amount;
        return types;
      }, {}),
      recentPayments: payments.slice(-5).reverse(),
    };

    return {
      message: 'success retrieve statics',
      details: {
        suppliersCount,
        purchaseInvoiceStats,
        saleInvoiceStats,
        expenseStats,
        paymentStats,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid parameters',
        errors: error.errors,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Error while fetching statistics',
    };
  }
};
