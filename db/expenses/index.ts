import { db } from '@/lib/db';
import { ExpenseCreateForm, ExpenseUpdateForm } from '@/query/expense/types';
import { getPurchaseInvoiceSchema } from '@/schema/purchase-invoices';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getExpenses = async (req: NextRequest) => {
  try {
    const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());

    const {
      search,
      filter,
      sortBy,
      sortOrder,
      page,
      pageSize,
    } = getPurchaseInvoiceSchema.parse(queryParams);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    if (filter) {
      try {
        const filterObject = JSON.parse(filter);
        Object.assign(where, filterObject);
      } catch {
        throw new Error('Invalid filter format');
      }
    }

    const [expenses, totalCount] = await db.$transaction([
      db.expense.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.expense.count({ where }),
    ]);

    return {
      details: expenses,
      message: 'expenses retrieving successfully',
      meta: { totalCount, page, pageSize },
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
      message: error instanceof Error ? error.message : 'Error while fetching expenses',
    };
  }
};
export async function getExpenseById(id: string) {
  const saleInvoice = await db.expense.findUnique({
    where: { id },
  });
  return {
    message: 'successful retrieve expense',
    details: saleInvoice,
  };
}

export async function createExpense(data: ExpenseCreateForm) {
  try {
    if (!data.name || !data.category || !data.amount) {
      throw new Error('Name, category, and amount are required fields.');
    }

    return await db.expense.create({
      data: {
        name: data.name,
        category: data.category,
        amount: data.amount,
        date: data.date || new Date(),
        notes: data.notes || null,
      },
    });
  } catch {
    throw new Error('Unable to create the expense. Please try again.');
  } finally {
    await db.$disconnect();
  }
}

export async function updateExpense(id: string, data: ExpenseUpdateForm) {
  try {
    if (!id) {
      throw new Error('Expense ID is required.');
    }
    if (Object.keys(data).length === 0) {
      throw new Error('No data provided to update.');
    }
    return await db.expense.update({
      where: { id },
      data,
    });
  } catch {
    throw new Error('Unable to update the expense. Please try again.');
  } finally {
    await db.$disconnect();
  }
}

export async function deleteExpense(id: string) {
  return db.expense.delete({
    where: { id },
  });
}
