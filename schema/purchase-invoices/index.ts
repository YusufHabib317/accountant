/* eslint-disable sonarjs/no-duplicate-string */
import { z } from 'zod';

export const purchaseInvoiceSchema = z.object({
  id: z.string(),
  date: z.string(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
    total: z.number(),
  })),
  subtotal: z.number(),
  tax: z.number().default(0),
  total: z.number(),
  paid: z.number().default(0),
  remaining: z.number().default(0),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  supplierId: z.string(),
  // Payment: z.array(PaymentSchema),
});

export const purchaseInvoiceSchemaTransform = purchaseInvoiceSchema.transform((item) => ({
  id: item?.id,
  date: item?.date,
  items: item.items,
  subtotal: item?.subtotal,
  tax: item?.tax,
  total: item?.total,
  paid: item?.paid,
  remaining: item?.remaining,
  notes: item?.notes,
  createdAt: item?.created_at,
  updatedAt: item?.updated_at,
  supplierId: item?.supplierId,
}));

export const purchasesInvoicesApiResponseSchema = z.array(purchaseInvoiceSchemaTransform);

const createPurchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  cost: z.number().positive('Cost must be positive'),
  total: z.number().positive('Total must be positive'),
});

export const createPurchaseSchema = z.object({
  date: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) {
        const currentDate = new Date();
        return currentDate.toISOString();
      }
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return date.toISOString();
    }),
  items: z.array(createPurchaseItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative').optional().default(0),
  total: z.number().positive('Total must be positive'),
  paid: z.number().min(0, 'Paid amount cannot be negative').default(0),
  remaining: z.number().min(0, 'Remaining amount cannot be negative').default(0),
  notes: z.string().optional(),
  supplierId: z.string(),
});
export const createPurchaseSchemaWithRefinements = createPurchaseSchema
  .refine(
    (data) => !!data.supplierId,
    {
      message: 'Supplier is required',
      path: ['supplierId'],
    },
  )
  .refine(
    (data) => Math.abs(data.total - (data.subtotal + (data.tax || 0))) < 0.01,
    {
      message: 'Total must equal subtotal plus tax',
      path: ['total'],
    },
  )
  .refine(
    (data) => Math.abs(data.remaining - (data.total - data.paid)) < 0.01,
    {
      message: 'Remaining amount must equal total minus paid amount',
      path: ['remaining'],
    },
  )
  .refine(
    (data) => {
      const itemsTotal = data.items.reduce((sum, item) => sum + item.total, 0);
      return Math.abs(data.subtotal - itemsTotal) < 0.01;
    },
    {
      message: 'Subtotal must equal sum of item totals',
      path: ['subtotal'],
    },
  )
  .refine(
    (data) => data.items.every((item) => Math.abs(item.total - (item.quantity * item.cost)) < 0.01),
    {
      message: 'Item total must equal quantity times cost',
      path: ['items'],
    },
  );

const updatePurchaseItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  cost: z.number().positive('Cost must be positive'),
  total: z.number().positive('Total must be positive'),
});

export const updatePurchaseSchema = z.object({
  date: z
    .string()
    .transform((val) => {
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return date.toISOString();
    })
    .optional(),
  items: z.array(updatePurchaseItemSchema).optional(),
  subtotal: z.number().positive('Subtotal must be positive').optional(),
  tax: z.number().min(0, 'Tax cannot be negative').optional(),
  total: z.number().positive('Total must be positive').optional(),
  paid: z.number().min(0, 'Paid amount cannot be negative').optional(),
  remaining: z.number().min(0, 'Remaining amount cannot be negative').optional(),
  notes: z.string().optional(),
  supplierId: z.string().optional(),
});
export const updatePurchaseSchemaWithRefinements = updatePurchaseSchema
  .refine(
    (data) => {
      if (data.total && data.subtotal && data.tax !== undefined) {
        return Math.abs(data.total - (data.subtotal + data.tax)) < 0.01;
      }
      return true;
    },
    {
      message: 'Total must equal subtotal plus tax',
      path: ['total'],
    },
  )
  .refine(
    (data) => {
      if (data.total && data.paid !== undefined && data.remaining !== undefined) {
        return Math.abs(data.remaining - (data.total - data.paid)) < 0.01;
      }
      return true;
    },
    {
      message: 'Remaining amount must equal total minus paid amount',
      path: ['remaining'],
    },
  )
  .refine(
    (data) => {
      if (data.subtotal && data.items) {
        const itemsTotal = data.items.reduce((sum, item) => sum + item.total, 0);
        return Math.abs(data.subtotal - itemsTotal) < 0.01;
      }
      return true;
    },
    {
      message: 'Subtotal must equal sum of item totals',
      path: ['subtotal'],
    },
  );

export function transformToPurchaseInvoiceUpdate(data: z.infer<typeof updatePurchaseSchemaWithRefinements>) {
  return {
    ...(data.date && { date: data.date }),
    ...(data.subtotal !== undefined && { subtotal: data.subtotal }),
    ...(data.tax !== undefined && { tax: data.tax }),
    ...(data.total !== undefined && { total: data.total }),
    ...(data.paid !== undefined && { paid: data.paid }),
    ...(data.remaining !== undefined && { remaining: data.remaining }),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.items && { items: data.items }),
    ...(data.supplierId && { supplier: data.supplierId }),
  };
}

export const getPurchaseInvoiceSchema = z.object({
  search: z.string().optional(),
  filter: z.string().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});
