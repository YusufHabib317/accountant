/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
import { db } from '@/lib/db';
import { SaleInvoiceCreateFormWithRefines, SaleInvoiceUpdateForm } from '@/query/sale-invoice/types';
import { getPurchaseInvoiceSchema } from '@/schema/purchase-invoices';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const getSaleInvoices = async (req: NextRequest, userId:string) => {
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

    const [saleInvoice, totalCount] = await db.$transaction([
      db.saleInvoice.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: true,
        },
      }),
      db.saleInvoice.count({ where }),
    ]);

    return {
      details: saleInvoice,
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
      message: error instanceof Error ? error.message : 'Error while fetching sale invoices',
    };
  }
};
export async function getSaleInvoiceById(id: string, userId:string) {
  const saleInvoice = await db.saleInvoice.findUnique({
    where: { id, userId },
    include: { items: true },
  });
  return {
    message: 'successful retrieve sale invoice',
    details: saleInvoice,
  };
}
export async function createSaleInvoice(data: SaleInvoiceCreateFormWithRefines, userId: string) {
  try {
    return await db.$transaction(async (prisma) => {
      const saleInvoice = await prisma.saleInvoice.create({
        data: {
          userId,
          customerName: data.customerName,
          date: new Date(data.date || new Date()),
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
              price: item.price,
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
        },
      });

      for (const item of data.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (data.paid > 0) {
        await prisma.payment.create({
          data: {
            userId,
            amount: data.paid,
            type: 'CUSTOMER_PAYMENT',
            saleInvoiceId: saleInvoice.id,
          },
        });
      }

      return saleInvoice;
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create sale invoice: ${error.message}`);
    }
    throw new Error('something went wrong');
  }
}

export async function updateSaleInvoice(id: string, data: SaleInvoiceUpdateForm, userId: string) {
  try {
    return await db.$transaction(async (prisma) => {
      const existingInvoice = await prisma.saleInvoice.findUnique({
        where: { id, userId },
        include: { items: true },
      });

      if (!existingInvoice) {
        throw new Error('Sale invoice not found');
      }

      const total = data.total ?? existingInvoice.total ?? 0;
      const paid = data.paid ?? existingInvoice.paid ?? 0;
      const remaining = total - paid;

      const paymentDifference = paid - existingInvoice.paid;

      if (paymentDifference !== 0) {
        await prisma.payment.create({
          data: {
            userId,
            amount: paymentDifference,
            type: 'CUSTOMER_PAYMENT',
            saleInvoiceId: id,
          },
        });
      }

      const stockAdjustments = [];

      const itemsToDelete = existingInvoice.items.filter(
        (item) => !data.items?.some((newItem) => newItem.id === item.id),
      );
      for (const item of itemsToDelete) {
        stockAdjustments.push({
          productId: item.productId,
          quantityChange: item.quantity,
        });
      }

      const itemsToUpdate = data.items?.filter((item) => item.id) || [];
      for (const item of itemsToUpdate) {
        const existingItem = existingInvoice.items.find((i) => i.id === item.id);
        if (existingItem) {
          const quantityDifference = existingItem.quantity - item.quantity;
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
          quantityChange: -item.quantity,
        });
      }

      for (const adjustment of stockAdjustments) {
        await prisma.product.update({
          where: { id: adjustment.productId },
          data: { stock: { increment: adjustment.quantityChange } },
        });
      }

      const itemsUpdate = {
        deleteMany: { id: { notIn: data.items?.map((item) => item.id || '') || [] } },
        upsert: data.items?.map((item) => ({
          where: { id: item.id || 'new-item' },
          create: {
            productId: item.productId,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          },
          update: {
            productId: item.productId,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          },
        })) || [],
      };

      return prisma.saleInvoice.update({
        where: { id, userId },
        data: {
          ...(data.customerName && { customerName: data.customerName }),
          ...(data.subtotal !== undefined && { subtotal: data.subtotal }),
          ...(data.tax !== undefined && { tax: data.tax }),
          ...(data.total !== undefined && { total }),
          ...(data.paid !== undefined && { paid }),
          ...(data.remaining !== undefined && { remaining }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.items && { items: itemsUpdate }),
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }, {
      timeout: 10000,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update sale invoice: ${error.message}`);
    }
    throw new Error('Something went wrong');
  }
}

export async function deletePurchaseInvoice(id: string) {
  return db.purchaseInvoice.delete({
    where: { id },
  });
}
