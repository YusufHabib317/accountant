/* eslint-disable no-console */
/* eslint-disable sonarjs/no-duplicate-string */
import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
import {
  createPurchaseInvoice,
  deletePurchaseInvoice,
  getPurchaseInvoiceById,
  getPurchaseInvoices,
  updatePurchaseInvoice,
} from '@/db/purchase-invoice';
import { createPurchaseSchemaWithRefinements, transformToPurchaseInvoiceUpdate, updatePurchaseSchema } from '@/schema/purchase-invoices';
import { createApiError } from '@/utils/api-handlers/create-api-error';
import { getUserId } from '@/utils/get-session';

export async function GET(req: NextRequest, res:NextResponse) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const purchaseInvoice = await getPurchaseInvoiceById(id, userId);

      if (!purchaseInvoice) {
        return NextResponse.json({ error: 'Purchase invoice not found' }, { status: 404 });
      }

      const successResponse = {
        success: true,
        message: purchaseInvoice.message,
        details: {
          data: purchaseInvoice.details,
          meta: undefined,
        },
      };

      return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
    }

    const purchaseInvoices = await getPurchaseInvoices(req, userId);
    const successResponse = {
      success: true,
      message: purchaseInvoices.message,
      details: {
        data: purchaseInvoices.details,
        meta: purchaseInvoices.meta,
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
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const validatedData = createPurchaseSchemaWithRefinements.parse(body);
    const newPurchaseInvoice = await createPurchaseInvoice(validatedData, userId);

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

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    await deletePurchaseInvoice(id, userId);
    return NextResponse.json(null, { status: HTTPS_CODES.NO_CONTENT });
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    const body = await req.json();

    const validatedData = updatePurchaseSchema.parse(body);

    const updateData = transformToPurchaseInvoiceUpdate(validatedData);
    const updatedPurchaseInvoice = await updatePurchaseInvoice(id, updateData, userId);

    const successResponse = {
      success: true,
      message: 'Purchase invoice updated successfully',
      details: updatedPurchaseInvoice,
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    console.log('🚀 ~ PUT ~ e:', e);
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
