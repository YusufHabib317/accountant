/* eslint-disable sonarjs/no-duplicate-string */
import { z } from 'zod';

export const saleInvoiceSchema = z.object({
  id: z.string(),
  date: z.string(),
  customerName: z.string(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    price: z.number(),
    total: z.number(),
    saleInvoiceId: z.string(),
    productId: z.string(),
  })),
  subtotal: z.number(),
  tax: z.number().default(0),
  total: z.number(),
  paid: z.number().default(0),
  remaining: z.number().default(0),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Payment: z.array(PaymentSchema),
});

export const saleInvoiceSchemaTransform = saleInvoiceSchema.transform((item) => ({
  id: item?.id,
  date: item?.date,
  customerName: item?.customerName,
  items: item.items,
  subtotal: item?.subtotal,
  tax: item?.tax,
  total: item?.total,
  paid: item?.paid,
  remaining: item?.remaining,
  notes: item?.notes,
  createdAt: item?.created_at,
  updatedAt: item?.updated_at,
}));

export const saleInvoicesApiResponseSchema = z.array(saleInvoiceSchemaTransform);

const createSaleItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  stock: z.number().int(),
  total: z.number().positive('Total must be positive'),
}).refine(
  (data) => data.quantity <= data.stock,
  {
    message: 'Quantity cannot exceed available stock',
    path: ['quantity'],
  },
);

export const createSaleSchema = z.object({
  customerName: z.string().min(3, { message: 'Customer name require' }),
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
  items: z.array(createSaleItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative').optional().default(0),
  total: z.number().positive('Total must be positive'),
  paid: z.number().min(0, 'Paid amount cannot be negative').default(0),
  remaining: z.number().min(0, 'Remaining amount cannot be negative').default(0),
  notes: z.string().optional(),
});

export const createSaleSchemaWithRefinements = createSaleSchema
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
    (data) => data.items.every((item) => Math.abs(item.total - (item.quantity * item.price)) < 0.01),
    {
      message: 'Item total must equal quantity times price',
      path: ['items'],
    },
  );

const updateSaleItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  stock: z.number().int(),
  total: z.number().positive('Total must be positive'),
}).refine(
  (data) => data.quantity <= data.stock,
  {
    message: 'Quantity cannot exceed available stock',
    path: ['quantity'],
  },
);

export const updateSaleSchema = z.object({
  customerName: z.string().min(3, { message: 'Customer name require' }).optional(),
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
  items: z.array(updateSaleItemSchema).optional(),
  subtotal: z.number().positive('Subtotal must be positive').optional(),
  tax: z.number().min(0, 'Tax cannot be negative').optional(),
  total: z.number().positive('Total must be positive').optional(),
  paid: z.number().min(0, 'Paid amount cannot be negative').optional(),
  remaining: z.number().min(0, 'Remaining amount cannot be negative').optional(),
  notes: z.string().optional(),
});
export const updateSaleSchemaWithRefinements = updateSaleSchema
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

export function transformToSaleInvoiceUpdate(data: z.infer<typeof updateSaleSchemaWithRefinements>) {
  return {
    ...(data.customerName && { date: data.customerName }),
    ...(data.date && { date: data.date }),
    ...(data.subtotal !== undefined && { subtotal: data.subtotal }),
    ...(data.tax !== undefined && { tax: data.tax }),
    ...(data.total !== undefined && { total: data.total }),
    ...(data.paid !== undefined && { paid: data.paid }),
    ...(data.remaining !== undefined && { remaining: data.remaining }),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.items && { items: data.items }),
  };
}

export const getSaleInvoiceSchema = z.object({
  search: z.string().optional(),
  filter: z.string().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});
