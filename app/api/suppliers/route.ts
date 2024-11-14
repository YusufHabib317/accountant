/* eslint-disable no-console */
/* eslint-disable sonarjs/no-duplicate-string */
import {
  getSuppliers,
  getSupplierById,
  deleteSupplier,
  updateSupplier,
} from '@/db/supplier';
import { NextRequest, NextResponse } from 'next/server';
import { createSupplierSchema } from '@/schema/suppliers';
import { HTTPS_CODES } from '@/data';
import createApiError from '@/utils/api-handlers/create-api-error';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, res:NextResponse) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const supplier = await getSupplierById(id);

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

    // const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    // console.log('🚀 ~ GET ~ queryParams:', queryParams);

    const suppliers = await getSuppliers(req);
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
    const body = await req.json();
    const validatedData = createSupplierSchema.parse(body);
    const newSupplier = await db.supplier.create({ data: validatedData });
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    await deleteSupplier(id);
    return NextResponse.json(null, { status: HTTPS_CODES.NO_CONTENT });
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
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }
    const body = await req.json();

    createSupplierSchema.parse(body);

    const updatedSupplier = await updateSupplier(id, body);

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
