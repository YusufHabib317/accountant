import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
import { getPaymentById, getPayments } from '@/db/payments';
import { createApiError } from '@/utils/api-handlers/create-api-error';

export async function GET(req: NextRequest, res:NextResponse) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const payment = await getPaymentById(id);

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      const successResponse = {
        success: true,
        message: payment.message,
        details: {
          data: payment.details,
          meta: undefined,
        },
      };

      return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
    }

    const payments = await getPayments(req);
    const successResponse = {
      success: true,
      message: payments.message,
      details: {
        data: payments.details,
        meta: payments.meta,
      },
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
