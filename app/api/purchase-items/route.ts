/* eslint-disable no-console */
/* eslint-disable sonarjs/no-duplicate-string */
import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
import { getPurchaseItemsByInvoiceId } from '@/db/purchase-items';
import { createApiError } from '@/utils/api-handlers/create-api-error';

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const { searchParams } = new URL(req.url);
    const purchaseInvoiceId = searchParams.get('id');

    if (!purchaseInvoiceId) {
      return NextResponse.json({ error: 'PurchaseInvoiceId is required' }, { status: 400 });
    }

    const purchaseItems = await getPurchaseItemsByInvoiceId(purchaseInvoiceId);

    if (!purchaseItems || purchaseItems.length === 0) {
      return NextResponse.json({ error: 'No purchase items found for the given invoice ID' }, { status: 404 });
    }

    const successResponse = {
      success: true,
      message: 'Purchase items retrieved successfully',
      details: {
        data: purchaseItems,
        meta: undefined,
      },
    };

    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
