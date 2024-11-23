/* eslint-disable sonarjs/no-duplicate-string */

import { db } from '@/lib/db';
import { supplierFormRequest } from '@/query/suppliers/types';
import { getSuppliersSchema } from '@/schema/suppliers';
import { Prisma, Supplier } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getSuppliers = async (req: NextRequest, userId: string) => {
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

    const where: Record<string, unknown> = { userId };

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

export async function getSupplierById(id: string, userId:string) {
  const supplier = await db.supplier.findUnique({
    where: { id, userId },
    include: { products: true },
  });
  return {
    message: 'successful retrieve supplier',
    details: supplier,
  };
}

export async function createSupplier(data: supplierFormRequest, userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required to create a supplier');
    }

    const newSupplier = await db.supplier.create({
      data: {
        ...data,
        id: undefined,
        userId,
      },
    });

    return {
      status: 201,
      message: 'Supplier created successfully',
      data: newSupplier,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return {
        status: 409,
        message: 'A supplier with this unique field already exists',
      };
    }

    if (e instanceof Error) {
      return {
        status: 500,
        message: 'An unexpected error occurred',
        details: e.message,
      };
    }
    return {
      status: 500,
      message: 'An unexpected error occurred',
      details: 'something wrong',
    };
  }
}
export async function deleteSupplier(id: string, userId: string) {
  try {
    const deletedSupplier = await db.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id, userId } });
      if (!supplier) {
        return {
          status: 409,
          success: false,
          message: 'Supplier not found',
        };
      }

      await tx.purchaseInvoice.deleteMany({ where: { supplierId: id } });

      return tx.supplier.delete({ where: { id } });
    });

    return {
      status: 200,
      success: true,
      message: 'Supplier deleted successfully',
      data: deletedSupplier,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          status: 404,
          success: false,
          message: `Supplier with ID ${id} not found`,
        };
      }
      if (error.code === 'P2003') {
        return {
          status: 409,
          success: false,
          message: 'Cannot delete supplier: Still has related records',
        };
      }
    }
    return {
      status: 500,
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateSupplier(id: string, data: Partial<Supplier>, userId: string) {
  const supplier = await db.supplier.findUnique({ where: { id, userId } });
  if (!supplier) {
    return {
      status: 404,
      success: false,
      message: 'Supplier not found or access denied',
    };
  }

  return db.supplier.update({
    where: { id, userId },
    data,
  });
}
