/* eslint-disable no-console */
/* eslint-disable sonarjs/no-duplicate-string */
import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import createApiError from '@/utils/api-handlers/create-api-error';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
} from '@/db/expenses';
import { createExpenseSchema, updateExpenseSchema } from '@/schema/expenses';

export async function GET(req: NextRequest, res:NextResponse) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const expense = await getExpenseById(id);

      if (!expense) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }

      const successResponse = {
        success: true,
        message: expense.message,
        details: {
          data: expense.details,
          meta: undefined,
        },
      };

      return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
    }
    const expenses = await getExpenses(req);
    const successResponse = {
      success: true,
      message: expenses.message,
      details: {
        data: expenses.details,
        meta: expenses.meta,
      },
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}

export async function POST(req: NextRequest, res:NextResponse) {
  try {
    const body = await req.json();
    const validatedData = createExpenseSchema.parse(body);
    const newPurchaseInvoice = await createExpense(validatedData);

    const successResponse = {
      success: true,
      message: 'Purchase Invoice created successfully',
      details: newPurchaseInvoice,
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.CREATED);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }
    const body = await req.json();

    const validatedData = updateExpenseSchema.parse(body);

    const updatedPurchaseInvoice = await updateExpense(id, validatedData);

    const successResponse = {
      success: true,
      message: 'Expense updated successfully',
      details: updatedPurchaseInvoice,
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    console.log('🚀 ~ PUT ~ e:', e);
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    await deleteExpense(id);
    return NextResponse.json(null, { status: HTTPS_CODES.NO_CONTENT });
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
