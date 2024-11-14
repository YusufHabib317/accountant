import { db } from '@/lib/db';
import { getSuppliersSchema } from '@/schema/suppliers';
import { Supplier } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getSuppliers = async (req: NextRequest) => {
  try {
    const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());

    const {
      search,
      filter,
      sortBy,
      sortOrder,
      page,
      pageSize,
    } = getSuppliersSchema.parse(queryParams);

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

    const [suppliers, totalCount] = await db.$transaction([
      db.supplier.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.supplier.count({ where }),
    ]);

    return {
      details: suppliers,
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
      message: error instanceof Error ? error.message : 'Error while fetching suppliers',
    };
  }
};
export async function getSupplierById(id: string) {
  const supplier = await db.supplier.findUnique({
    where: { id },
    include: { products: true },
  });
  return {
    message: 'successful retrieve supplier',
    details: supplier,
  };
}

export async function createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.supplier.create({ data });
}

export async function updateSupplier(id: string, data: Partial<Supplier>) {
  return db.supplier.update({
    where: { id },
    data,
  });
}

export async function deleteSupplier(id: string) {
  return db.supplier.delete({
    where: { id },
  });
}
