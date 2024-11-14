/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@/lib/db';
import { PurchaseInvoiceCreateFormWithRefines, PurchaseInvoiceUpdateForm } from '@/query/purchase-invoice/types';
import { getPurchaseInvoiceSchema } from '@/schema/purchase-invoices';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getPurchaseInvoices = async (req: NextRequest) => {
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

    const [purchaseInvoice, totalCount] = await db.$transaction([
      db.purchaseInvoice.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: true,
        },
      }),
      db.purchaseInvoice.count({ where }),
    ]);

    return {
      details: purchaseInvoice,
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
export async function getPurchaseInvoiceById(id: string) {
  const product = await db.purchaseInvoice.findUnique({
    where: { id },
    include: { items: true },
  });
  return {
    message: 'successful retrieve purchase invoice',
    details: product,
  };
}

// export async function createPurchaseInvoice(data: PurchaseInvoiceCreateFormWithRefines) {
//   await db.purchaseInvoice.create({
//     data: {
//       date: new Date(data.date || new Date()),
//       subtotal: data.subtotal,
//       tax: data.tax,
//       total: data.total,
//       paid: data.paid,
//       remaining: data.remaining,
//       notes: data.notes,
//       items: {
//         create: data.items.map((item) => ({
//           productId: item.productId,
//           quantity: item.quantity,
//           cost: item.cost,
//           total: item.total,
//         })),
//       },
//       supplier: {
//         connect: { id: data.supplierId },
//       },
//     },
//     include: {
//       items: {
//         include: {
//           product: true,
//         },
//       },
//       supplier: true,
//     },
//   });
// }

export async function createPurchaseInvoice(data: PurchaseInvoiceCreateFormWithRefines) {
  try {
    const purchaseInvoice = await db.purchaseInvoice.create({
      data: {
        date: data.date,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        paid: data.paid,
        remaining: data.total - data.paid,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost,
            total: item.total,
          })),
        },
        supplier: {
          connect: { id: data.supplierId },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supplier: true,
      },
    });

    if (data.paid > 0) {
      await db.payment.create({
        data: {
          amount: data.paid,
          type: 'SUPPLIER_PAYMENT',
          purchaseInvoiceId: purchaseInvoice.id,
        },
      });
    }

    return purchaseInvoice;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create purchase invoice: ${error.message}`);
    }
    throw new Error('something went wrong');
  }
}

export async function updatePurchaseInvoice(id: string, data: PurchaseInvoiceUpdateForm) {
  try {
    const existingInvoice = await db.purchaseInvoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingInvoice) {
      throw new Error('Purchase invoice not found');
    }

    const total = data.total ?? existingInvoice.total;
    const paid = data.paid ?? existingInvoice.paid;
    const remaining = total - paid;

    const paymentDifference = paid - existingInvoice.paid;

    if (paymentDifference !== 0) {
      await db.payment.create({
        data: {
          amount: paymentDifference,
          type: 'SUPPLIER_PAYMENT',
          purchaseInvoiceId: id,
        },
      });
    }

    const itemsUpdate = {
      deleteMany: { id: { notIn: data.items?.map((item) => item.id || '') || [] } },
      upsert: data.items?.map((item) => ({
        where: { id: item.id || 'new-item' },
        create: { ...item },
        update: { ...item },
      })) || [],
    };

    let supplierUpdate = {};
    if (data.supplierId) {
      supplierUpdate = {
        connect: { id: data.supplierId },
      };
    }

    return db.purchaseInvoice.update({
      where: { id },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.subtotal !== undefined && { subtotal: data.subtotal }),
        ...(data.tax !== undefined && { tax: data.tax }),
        ...(data.total !== undefined && { total }),
        ...(data.paid !== undefined && { paid }),
        ...(data.remaining !== undefined && { remaining }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.items && { items: itemsUpdate }),
        ...(data.supplierId && { supplier: supplierUpdate }),
      },
      include: {
        items: {
          include: { product: true },
        },
        supplier: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update purchase invoice: ${error.message}`);
    }
    throw new Error('something went wrong');
  }
}

export async function deletePurchaseInvoice(id: string) {
  return db.purchaseInvoice.delete({
    where: { id },
  });
}
