import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
import {
  createSaleInvoice,
  getSaleInvoiceById,
  getSaleInvoices,
  updateSaleInvoice,
} from '@/db/sale-invoice';
import {
  createSaleSchemaWithRefinements, updateSaleSchemaWithRefinements,
} from '@/schema/sale-invoices';
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
      const saleInvoice = await getSaleInvoiceById(id, userId);

      if (!saleInvoice) {
        return NextResponse.json({ error: 'Sale invoice not found' }, { status: 404 });
      }

      const successResponse = {
        success: true,
        message: saleInvoice.message,
        details: {
          data: saleInvoice.details,
          meta: undefined,
        },
      };

      return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
    }

    const saleInvoices = await getSaleInvoices(req, userId);
    const successResponse = {
      success: true,
      message: saleInvoices.message,
      details: {
        data: saleInvoices.details,
        meta: saleInvoices.meta,
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
    const validatedData = createSaleSchemaWithRefinements.parse(body);
    const newSaleInvoice = await createSaleInvoice(validatedData, userId);

    const successResponse = {
      success: true,
      message: 'Sale Invoice created successfully',
      details: newSaleInvoice,
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.CREATED);
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
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }
    const body = await req.json();

    const validatedData = updateSaleSchemaWithRefinements.parse(body);

    const updatedSaleInvoice = await updateSaleInvoice(id, validatedData, userId);

    const successResponse = {
      success: true,
      message: 'Sale invoice updated successfully',
      details: updatedSaleInvoice,
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
