import { db } from '@/lib/db';
import { getProductsSchema } from '@/schema/products';
import { Product } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getProducts = async (req: NextRequest) => {
  try {
    const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());

    const {
      search,
      filter,
      sortBy,
      sortOrder,
      page,
      pageSize,
    } = getProductsSchema.parse(queryParams);

    const where: Record<string, unknown> = {};

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

    const [products, totalCount] = await db.$transaction([
      db.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    return {
      details: products,
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
      message: error instanceof Error ? error.message : 'Error while fetching products',
    };
  }
};
export async function getProductById(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    // include: { product: true, invoices: true },
  });
  return {
    message: 'successful retrieve product',
    details: product,
  };
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.product.create({ data });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return db.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  return db.product.delete({
    where: { id },
  });
}
