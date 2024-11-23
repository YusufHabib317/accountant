/* eslint-disable no-console */
/* eslint-disable sonarjs/no-duplicate-string */
import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';
import { db } from '@/lib/db';
import {
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,

} from '@/db/product';
import { createProductSchema, updateProductSchema } from '@/schema/products';
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
      const product = await getProductById(id, userId);

      if (!product) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }

      const successResponse = {
        success: true,
        message: product.message,
        details: {
          data: product.details,
          meta: undefined,
        },
      };

      return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
    }
    const products = await getProducts(req, userId);
    const successResponse = {
      success: true,
      message: products.message,
      details: {
        data: products.details,
        meta: products.meta,
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
    const validatedData = createProductSchema.parse(body);
    const newSupplier = await db.product.create({
      data: {
        ...validatedData,
        userId,
      },
    });
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

    await deleteProduct(id, userId);
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

    const validatedData = updateProductSchema.parse(body);

    const updatedSupplier = await updateProduct(id, validatedData, userId);

    const successResponse = {
      success: true,
      message: 'Product updated successfully',
      details: updatedSupplier,
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
