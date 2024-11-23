/* eslint-disable no-console */
/* eslint-disable sonarjs/no-duplicate-string */

import {
  getSuppliers,
  getSupplierById,
  deleteSupplier,
  createSupplier,
  updateSupplier,
} from '@/db/supplier';
import { NextRequest, NextResponse } from 'next/server';
import { createSupplierSchema } from '@/schema/suppliers';
import { HTTPS_CODES } from '@/data';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
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
      const supplier = await getSupplierById(id, userId!);

      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }

      const successResponse = {
        success: true,
        message: supplier.message,
        details: {
          data: supplier.details,
          meta: undefined,
        },
      };

      return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
    }

    const suppliers = await getSuppliers(req, userId!);
    const successResponse = {
      success: true,
      message: suppliers.message,
      details: {
        data: suppliers.details,
        meta: suppliers.meta,
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
    const validatedData = createSupplierSchema.parse(body);
    const newSupplier = await createSupplier(validatedData, userId);
    const successResponse = {
      success: true,
      message: 'Supplier created successfully',
      details: newSupplier,
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
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }
    const body = await req.json();

    createSupplierSchema.parse(body);

    const updatedSupplier = await updateSupplier(id, body, userId!);

    const successResponse = {
      success: true,
      message: 'Supplier updated successfully',
      details: updatedSupplier,
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}

export async function DELETE(
  req: NextRequest,
): Promise<NextResponse> {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({
      status: 400,
      success: false,
      message: 'Supplier ID is required',
    }, { status: 400 });
  }

  const result = await deleteSupplier(id, userId!);
  return NextResponse.json(result, { status: result.status });
}
