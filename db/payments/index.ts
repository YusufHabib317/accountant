import { db } from '@/lib/db';
import { getPurchaseInvoiceSchema } from '@/schema/purchase-invoices';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getPayments = async (req: NextRequest) => {
  try {
    const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());

    const {
      search,
      filter,
      sortBy,
      sortOrder,
      page,
      pageSize,
    } = getPurchaseInvoiceSchema.parse(queryParams);

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

    const [payments, totalCount] = await db.$transaction([
      db.payment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.payment.count({ where }),
    ]);

    return {
      details: payments,
      message: 'payments retrieving successfully',
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
      message: error instanceof Error ? error.message : 'Error while fetching payments',
    };
  }
};
export async function getPaymentById(id: string) {
  const saleInvoice = await db.payment.findUnique({
    where: { id },
  });
  return {
    message: 'successful retrieve payment',
    details: saleInvoice,
  };
}
