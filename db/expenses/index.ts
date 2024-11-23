/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
import { ExpenseCreateForm, ExpenseUpdateForm } from '@/query/expense/types';
import { getPurchaseInvoiceSchema } from '@/schema/purchase-invoices';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const getExpenses = async (req: NextRequest, userId: string) => {
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

    const where: Record<string, unknown> = { userId };

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
export async function getExpenseById(id: string, userId: string) {
  const saleInvoice = await db.expense.findUnique({
    where: { id, userId },
  });
  return {
    message: 'successful retrieve expense',
    details: saleInvoice,
  };
}

export async function createExpense(data: ExpenseCreateForm, userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!data.name || !data.category || !data.amount) {
      throw new Error('Name, category, and amount are required fields');
    }

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a valid positive number');
    }

    // Parse date or use current date
    let date: Date;
    try {
      date = data.date ? new Date(data.date) : new Date();
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
    } catch {
      throw new Error('Invalid date format');
    }

    // Create the expense record
    return await db.expense.create({
      data: {
        userId,
        name: data.name.trim(),
        category: data.category.trim(),
        amount,
        date,
        notes: data.notes?.trim() || null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    // Handle unknown errors
    console.error('Unexpected error:', error);
    throw new Error('Unable to create the expense. Please try again.');
  } finally {
    try {
      await db.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}

export async function updateExpense(id: string, data: ExpenseUpdateForm, userId: string) {
  try {
    if (!id || !userId) {
      throw new Error('Expense ID and User ID are required');
    }

    const existingExpense = await db.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingExpense) {
      throw new Error('Expense not found or unauthorized');
    }

    const updateData: Prisma.ExpenseUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.category !== undefined) {
      updateData.category = data.category.trim();
    }

    if (data.amount !== undefined) {
      const amount = Number(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a valid positive number');
      }
      updateData.amount = amount;
    }

    if (data.date !== undefined) {
      try {
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        updateData.date = date;
      } catch {
        throw new Error('Invalid date format');
      }
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes.trim() || null;
    }

    return await db.expense.update({
      where: {
        id,
        userId,
      },
      data: updateData,
    });
  } catch (error) {
    // Handle Prisma specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new Error('Expense not found');
        case 'P2002':
          throw new Error('A similar expense record already exists');
        default:
          console.error('Database error:', error);
          throw new Error('Database error occurred while updating expense');
      }
    }

    // Handle validation errors
    if (error instanceof Error) {
      throw error;
    }

    console.error('Unexpected error:', error);
    throw new Error('Unable to update the expense. Please try again.');
  } finally {
    try {
      await db.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}

export async function deleteExpense(id: string, userId: string) {
  return db.expense.delete({
    where: { id, userId },
  });
}
