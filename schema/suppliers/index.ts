import { z } from 'zod';

export const supplierBackendSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().email().optional(),
  company_name: z.string().optional(),
  notes: z.string().optional(),
  products: z.array(z.object({})).nullable(),
  invoice: z.array(z.object({})).nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const supplierApiResponse = supplierBackendSchema.transform((item) => ({
  id: item.id,
  name: item.name,
  phone: item.phone,
  address: item.address,
  city: item.city,
  email: item.email,
  companyName: item.company_name,
  notes: item.notes,
  products: item.products,
  invoice: item.invoice,
  createAt: item.created_at,
  updateAt: item.updated_at,
}));

export const suppliersApiResponseSchema = z.array(supplierApiResponse);

export const createSupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().email().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

export const getSuppliersSchema = z.object({
  search: z.string().optional(),
  filter: z.string().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});
