/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { db } from '@/lib/db';
import { PurchaseInvoiceCreateFormWithRefines, PurchaseInvoiceUpdateForm } from '@/query/purchase-invoice/types';
import { getPurchaseInvoiceSchema } from '@/schema/purchase-invoices';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getPurchaseInvoices = async (req: NextRequest, userId:string) => {
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
export async function getPurchaseInvoiceById(id: string, userId:string) {
  const product = await db.purchaseInvoice.findUnique({
    where: { id, userId },
    include: { items: true },
  });
  return {
    message: 'successful retrieve purchase invoice',
    details: product,
  };
}
export async function createPurchaseInvoice(data: PurchaseInvoiceCreateFormWithRefines, userId: string) {
  try {
    return await db.$transaction(async (prisma) => {
      const purchaseInvoice = await prisma.purchaseInvoice.create({
        data: {
          userId,
          date: data.date,
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
          paid: data.paid,
          remaining: data.total - data.paid,
          notes: data.notes,
          supplierId: data.supplierId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              cost: item.cost,
              total: item.total,
            })),
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

      for (const item of data.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      if (data.paid > 0) {
        await prisma.payment.create({
          data: {
            userId,
            amount: data.paid,
            type: 'SUPPLIER_PAYMENT',
            purchaseInvoiceId: purchaseInvoice.id,
          },
        });
      }

      return purchaseInvoice;
    }, {
      timeout: 10000,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create purchase invoice: ${error.message}`);
    }
    throw new Error('Something went wrong');
  }
}

export async function updatePurchaseInvoice(id: string, data: PurchaseInvoiceUpdateForm, userId: string) {
  try {
    const stockAdjustments: { productId: string; quantityChange: number; }[] = [];
    await db.$transaction(async (prisma) => {
      const existingInvoice = await prisma.purchaseInvoice.findUnique({
        where: { id, userId },
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
        await prisma.payment.create({
          data: {
            userId,
            amount: paymentDifference,
            type: 'SUPPLIER_PAYMENT',
            purchaseInvoiceId: id,
          },
        });
      }

      const itemsToDelete = existingInvoice.items.filter(
        (item) => !data.items?.some((newItem) => newItem.id === item.id),
      );
      for (const item of itemsToDelete) {
        stockAdjustments.push({
          productId: item.productId,
          quantityChange: -item.quantity,
        });
      }

      const itemsToUpdate = data.items?.filter((item) => item.id) || [];
      for (const item of itemsToUpdate) {
        const existingItem = existingInvoice.items.find((i) => i.id === item.id);
        if (existingItem) {
          const quantityDifference = item.quantity - existingItem.quantity;
          stockAdjustments.push({
            productId: item.productId,
            quantityChange: quantityDifference,
          });
        }
      }

      const itemsToCreate = data.items?.filter((item) => !item.id) || [];
      for (const item of itemsToCreate) {
        stockAdjustments.push({
          productId: item.productId,
          quantityChange: item.quantity,
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

      await prisma.purchaseInvoice.update({
        where: { id, userId },
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
      });
    });

    for (const adjustment of stockAdjustments) {
      await db.product.update({
        where: { id: adjustment.productId },
        data: { stock: { increment: adjustment.quantityChange } },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update purchase invoice: ${error.message}`);
    }
    throw new Error('something went wrong');
  }
}

export async function deletePurchaseInvoice(id: string, userId:string) {
  return db.purchaseInvoice.delete({
    where: { id },
  });
}
