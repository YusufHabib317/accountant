import { z } from 'zod';
import { suppliersApiResponseSchema } from '../suppliers';

export const productBackendSchema = z.object({
  id: z.string().cuid(),
  name: z.string().nullable(),
  code: z.string().optional().nullable(),
  price: z.number().positive('Price must be a positive number'),
  sale_price: z.number().positive('Sale price must be a positive number').optional(),
  cost: z.number().positive('Cost must be a positive number'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  purchase_items: z.array(z.object({
    id: z.string().cuid(),
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
  })).optional(),
  sale_items: z.array(z.object({
    id: z.string().cuid(),
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
  })).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  Supplier: suppliersApiResponseSchema.optional(),
});

export const productApiResponse = productBackendSchema.transform((item) => ({
  id: item.id,
  name: item.name || '',
  code: item.code || '',
  price: item.price,
  salePrice: item.sale_price || 0,
  cost: item.cost,
  stock: item.stock,
  purchaseItems: item.purchase_items || [],
  saleItems: item.sale_items || [],
  createAt: item.created_at,
  updateAt: item.updated_at,
}));

export const productsApiResponseSchema = z.array(productApiResponse);

export const createProductSchema = z.object({
  name: z.string().min(3, { message: 'name is require' }),
  code: z.string().min(3, { message: 'code is require' }),
  price: z.coerce.number().positive(),
  salePrice: z.coerce.number().positive(),
  cost: z.coerce.number().positive(),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductsSchema = z.object({
  search: z.string().optional(),
  filter: z.string().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});
