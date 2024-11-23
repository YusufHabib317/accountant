import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';

import { getStatics } from '@/db/statics';
import { createApiError } from '@/utils/api-handlers/create-api-error';

type StatisticsResponse = {
  message: string;
  details: {
    suppliersCount: number;
    purchaseInvoiceStats: {
      totalInvoices: number;
      totalAmount: number;
      totalPaid: number;
      totalRemaining: number;
    };
    saleInvoiceStats: {
      totalInvoices: number;
      totalAmount: number;
      totalPaid: number;
      totalRemaining: number;
    };
    expenseStats: {
      totalExpenses: number;
      totalAmount: number;
      byCategory: Record<string, number>;
    };
    paymentStats: {
      totalPayments: number;
      totalAmount: number;
      byType: Record<string, number>;
      recentPayments: Array<{ amount: number; type: string; date: Date }>;
    };
  };
};

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const response = await getStatics(req);
    const data = await response.json() as StatisticsResponse;

    const successResponse = {
      success: true,
      message: data.message,
      details: {
        data: data.details,
      },
    };

    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
