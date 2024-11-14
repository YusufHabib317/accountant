import { PaymentType } from '@prisma/client';
import { z } from 'zod';

export const paymentApiResponseSchema = z.object({
  id: z.string().cuid(),
  amount: z.number().positive('amount must be a positive number'),
  date: z.string(),
  type: z.nativeEnum(PaymentType),
  notes: z.string(),
  purchaseInvoiceId: z.string(),
  saleInvoiceId: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const paymentApiResponseTransformer = paymentApiResponseSchema.transform((item) => ({
  id: item.id,
  amount: item.amount,
  date: item.date,
  note: item.notes,
  type: item.type,
  purchaseInvoiceId: item.purchaseInvoiceId,
  saleInvoiceId: item.saleInvoiceId,
  createAt: item.created_at,
  updateAt: item.updated_at,
}));

export const paymentsApiResponseSchema = z.array(paymentApiResponseTransformer);

export const getExpenseSchema = z.object({
  search: z.string().optional(),
  filter: z.string().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});
